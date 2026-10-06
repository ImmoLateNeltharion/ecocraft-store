# Практика: EcoCraft Store на k3s

Цель — перенести то, что сейчас крутится в `docker-compose.yml` (Postgres + Next.js + nginx),
в одноузловой кластер k3s на виртуалке. Задания идут по порядку, каждое опирается на предыдущее.
Манифесты складывай рядом, в `deploy/k8s/`.

Решений тут нет — только что сделать, как проверить и подсказки. Подсказки сначала не открывай.

---

## Задание 0. Виртуалка и k3s

**Сделать**

1. Подними VM: Ubuntu 22.04/24.04 или Debian 12, **2 vCPU, 4 ГБ RAM, 20+ ГБ диска**
   (сборка образа Next.js ест ~1.5 ГБ памяти). Сеть — bridge или host-only, чтобы VM была доступна с твоей машины по IP.
2. Установи k3s одной командой с официального сайта. Traefik и local-path-provisioner **не отключай** — они понадобятся.
3. Настрой `kubectl` на своей машине (не на VM) так, чтобы он ходил в кластер.

**Проверка**

```bash
kubectl get nodes -o wide          # нода в статусе Ready
kubectl get pods -A                # coredns, traefik, local-path-provisioner, metrics-server — Running
kubectl get storageclass           # local-path (default)
```

<details><summary>Подсказки</summary>

- Kubeconfig лежит в `/etc/rancher/k3s/k3s.yaml`, в нём `server: https://127.0.0.1:6443` — замени на IP VM.
- Если с хоста не пускает по сертификату — посмотри флаг `--tls-san` у установщика.
- Порт 6443 должен быть открыт в файрволе VM.
</details>

**Вопросы себе:** где k3s хранит данные (`/var/lib/rancher/k3s`)? Какой container runtime он использует вместо Docker?

---

## Задание 1. Образ приложения внутри кластера

У нас нет registry. Нужно, чтобы k3s увидел локально собранный образ.

**Сделать**

1. Собери образ из `Dockerfile` с тегом `ecocraft-store:0.1.0`. Передай build-arg
   `NEXT_PUBLIC_SITE_URL=http://ecocraft.local` — он вшивается в бандл на этапе сборки.
2. Загрузи образ в containerd k3s **без** registry.
3. Убедись, что образ виден кластеру.

**Проверка**

```bash
sudo k3s crictl images | grep ecocraft
```

<details><summary>Подсказки</summary>

- `docker save ... | sudo k3s ctr images import -`
- В манифестах потом понадобится `imagePullPolicy: IfNotPresent` (или `Never`), иначе k3s полезет в Docker Hub.
- Тег `latest` по умолчанию включает `imagePullPolicy: Always` — поэтому тег с версией.
</details>

**Бонус:** подними локальный registry (`registry:2`) на VM и настрой k3s ходить в него через `/etc/rancher/k3s/registries.yaml`.

---

## Задание 2. PostgreSQL в StatefulSet

**Сделать** (namespace `ecocraft`)

1. `Namespace` `ecocraft`.
2. `Secret` с `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — **создай через `kubectl create secret`**, в git пароль не коммить.
3. `StatefulSet` `postgres` (образ `postgres:16-alpine`, 1 реплика) с `volumeClaimTemplates` на 1Gi.
4. Headless `Service` `postgres` на 5432.
5. `readinessProbe` через `pg_isready` — по аналогии с healthcheck из compose.

**Проверка**

```bash
kubectl -n ecocraft get sts,pod,pvc,svc
kubectl -n ecocraft exec -it postgres-0 -- psql -U ecocraft -c 'select 1'
# создай таблицу, удали под, дождись пересоздания — таблица должна остаться
kubectl -n ecocraft delete pod postgres-0
```

<details><summary>Подсказки</summary>

- Postgres ругается, если в каталоге данных есть `lost+found` — задай `PGDATA` в подкаталог тома.
- Переменные из Secret — через `envFrom: secretRef`.
- Посмотри, куда local-path физически положил данные на VM (`/var/lib/rancher/k3s/storage/`).
</details>

**Вопрос себе:** почему StatefulSet, а не Deployment? Что будет с PVC, если удалить StatefulSet?

---

## Задание 3. Приложение в Deployment

**Сделать**

1. `ConfigMap` с несекретными переменными (`NEXT_PUBLIC_SITE_URL`, `LEGAL_*`).
2. `Secret` `ecocraft-app` с `DATABASE_URL` (хост — DNS-имя сервиса Postgres) и при желании `TELEGRAM_*`, `YOOKASSA_*`.
3. `PersistentVolumeClaim` под фото товаров (`/app/public/images/products`) и загрузки (`/app/public/uploads`).
4. `Deployment` `ecocraft-app`, 1 реплика, порт 3000, с:
   - `readinessProbe` на `/api/health`;
   - `livenessProbe` — **подумай, на что** (см. вопрос ниже);
   - `startupProbe` — при старте применяются миграции, это небыстро;
   - `resources.requests/limits`.
5. `Service` `ecocraft-app` типа ClusterIP, порт 80 → 3000.

**Проверка**

```bash
kubectl -n ecocraft rollout status deploy/ecocraft-app
kubectl -n ecocraft logs deploy/ecocraft-app      # видно "Применяю миграции" и "Запускаю приложение"
kubectl -n ecocraft port-forward svc/ecocraft-app 8080:80
curl localhost:8080/api/health                    # {"ok":true}
```

Открой `http://localhost:8080` — каталог с фото товаров.

<details><summary>Подсказки</summary>

- Контейнер работает от пользователя `nextjs`, а свежий том принадлежит root — получишь `EACCES` при копировании фото.
  Узнай uid/gid (`docker run --rm --entrypoint id ecocraft-store:0.1.0`) и задай `securityContext.fsGroup`.
- `/api/health` проверяет **ещё и базу**. Если повесить его на liveness — что сделает kubelet с подами приложения, когда упадёт Postgres?
  Для liveness достаточно `tcpSocket` на 3000.
- Пока Postgres не готов, миграции упадут и под уйдёт в CrashLoopBackOff. Вариант лучше — `initContainer`,
  который ждёт `pg_isready -h postgres`.
</details>

**Вопрос себе:** можно ли поднять `replicas: 2`? Что помешает со стороны тома под фото (`ReadWriteOnce` у local-path)?
А с миграциями при одновременном старте двух подов?

---

## Задание 4. Ingress через Traefik

**Сделать**

1. `Ingress` (ingressClassName `traefik`) на хост `ecocraft.local` → сервис `ecocraft-app`.
2. На своей машине пропиши в `/etc/hosts`: `<IP_VM> ecocraft.local`.
3. Увеличь лимит размера тела запроса, если загрузка фото через админку падает (в compose это делал nginx).

**Проверка**

```bash
curl -I http://ecocraft.local/          # 200 от Traefik
```

В браузере открывается магазин, работает корзина и оформление заказа.

**Бонус — TLS:**
- уровень 1: самоподписанный сертификат через `openssl`, `kubectl create secret tls`, секция `tls:` в Ingress;
- уровень 2: поставь cert-manager (helm), сделай `ClusterIssuer` типа `selfSigned` и получи сертификат через аннотацию.

Не забудь, что `NEXT_PUBLIC_SITE_URL` вшит в образ — при переходе на https нужна пересборка (как и в `deploy/update.sh`).

---

## Задание 5. Эксплуатация

**5.1. Админ.** Создай администратора той же командой, что в `DEPLOY.md`, но через `kubectl exec`. Зайди в `/admin`, загрузи фото товару.

**5.2. Переживёт ли рестарт?** Удали под приложения. Фото, загруженное в 5.1, должно остаться.

**5.3. Обновление и откат.**
1. Поменяй что-нибудь заметное (текст на главной), собери `ecocraft-store:0.2.0`, импортируй, обнови образ в Deployment.
2. Посмотри `kubectl rollout history`.
3. Откати на 0.1.0 через `kubectl rollout undo`.
4. Сломай специально: укажи несуществующий тег. Что показывает `kubectl describe pod`? Почему старый под продолжает обслуживать трафик?

**5.4. Бэкап по расписанию.** Сделай `CronJob`, который раз в сутки делает `pg_dump | gzip` в отдельный PVC
и хранит 7 последних файлов (аналог `deploy/backup.sh`). Запусти вручную:

```bash
kubectl -n ecocraft create job --from=cronjob/pg-backup pg-backup-manual
```

и проверь, что дамп восстанавливается в чистую базу.

**5.5. Kustomize.** Собери все манифесты в `kustomization.yaml`, чтобы весь стек разворачивался одной командой:

```bash
kubectl apply -k deploy/k8s/
```

Секреты генерируй через `secretGenerator` из файла `.env.k8s`, который добавлен в `.gitignore`.

---

## Финальный чек-лист

- [ ] `kubectl delete ns ecocraft && kubectl apply -k deploy/k8s/` — магазин поднимается с нуля без ручных шагов (кроме создания админа)
- [ ] Ни одного пароля в git
- [ ] Перезагрузка VM (`sudo reboot`) — после неё всё поднимается само, данные на месте
- [ ] Падение Postgres не приводит к рестартам подов приложения, только к снятию их из балансировки
- [ ] Можешь объяснить, почему каждый probe настроен именно так
