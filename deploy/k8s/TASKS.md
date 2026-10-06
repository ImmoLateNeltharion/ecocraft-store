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

---

# Часть 2. Кластер из 4 нод (VMware, клоны golden)

Дальше всё то же самое, но на четырёх машинах. Здесь начинается то, чего на одной ноде не видно:
кворум etcd, доставка образов на каждую ноду, привязка томов к машине, падение ноды.

Схема: **3 server (HA, встроенный etcd) + 1 agent.**

| VM      | роль                    |
|---------|-------------------------|
| k3s-1   | server (`--cluster-init`) |
| k3s-2   | server                  |
| k3s-3   | server                  |
| k3s-4   | agent                   |

---

## Задание 6. Подготовка клонов

Клоны golden одинаковые до последнего байта. Для k3s это ломает регистрацию нод (`Node password rejected`),
а для DHCP — выдачу адресов (одинаковый machine-id → одинаковый client-id → один IP на двоих).

**Сделать** на каждой VM: уникальные hostname, machine-id, SSH host keys, статический IP, `/etc/hosts` со всеми четырьмя нодами.
Если на golden был k3s — снести его (`k3s-uninstall.sh`, `/etc/rancher`, `/var/lib/rancher`).

**Проверка** — с твоей машины:

```bash
for h in k3s-1 k3s-2 k3s-3 k3s-4; do ssh $h 'echo "$(hostname) $(cat /etc/machine-id) $(hostname -I)"'; done
```

Все три колонки должны различаться. Время на нодах синхронизировано (`timedatectl` → `System clock synchronized: yes`) — etcd это важно.

**Бонус:** вместо ручной правки — скрипт `prepare-clone.sh <hostname> <ip>`, который делает всё одним запуском.
Или Ansible-плейбук на все четыре машины.

---

## Задание 7. HA control plane

**Сделать**

1. Первый server поднять с `--cluster-init`, задать общий токен.
2. Второй и третий server — присоединить к первому (`--server https://k3s-1:6443`).
3. k3s-4 — агентом.
4. Во всех серверах указать `--tls-san` с IP каждого сервера, чтобы kubeconfig работал через любой из них.
   Удобно положить параметры в `/etc/rancher/k3s/config.yaml`, а не в аргументы установщика.

**Проверка**

```bash
kubectl get nodes -o wide
# k3s-1..3: control-plane,etcd,master ; k3s-4: <none>
```

**Эксперимент с кворумом**

1. Выключи k3s-3 (Power Off в VMware, не `shutdown` — имитируем аварию). `kubectl get nodes` работает?
2. Выключи ещё k3s-2. Теперь работает? Почему, если k3s-1 жив?
3. Включи обе обратно — кластер восстановился сам?
4. Что будет, если kubeconfig смотрит на выключенный сервер? Как бы ты решил это в проде?

<details><summary>Подсказки</summary>

- Etcd нужен кворум: из 3 членов — минимум 2. Поэтому серверов нечётное число, и 4-й сервер не добавил бы отказоустойчивости.
- Для единой точки входа к API смотрят в сторону виртуального IP: kube-vip или keepalived. Это хороший бонус.
- Порты между нодами: 6443 (API), 2379–2380 (etcd), 8472/udp (flannel VXLAN), 10250 (kubelet).
</details>

---

## Задание 8. Образы на всех нодах

Трюк с `k3s ctr images import` из задания 1 теперь не работает: под может сесть на любую ноду,
а образ есть только там, куда его импортировали.

**Сделать**

1. Подними registry (`registry:2`) — либо как под в кластере, либо контейнером на одной из VM.
2. Пропиши его на **всех** нодах в `/etc/rancher/k3s/registries.yaml` (http без TLS — через `mirrors` + `configs`), перезапусти k3s/k3s-agent.
3. Запушь `ecocraft-store:0.1.0` в registry и поменяй `image:` в Deployment.

**Проверка**

```bash
kubectl -n ecocraft delete pod -l app=ecocraft-app
kubectl -n ecocraft get pod -o wide   # под стартовал на ноде, где образа раньше не было
```

**Вопрос себе:** если registry живёт в самом кластере — что будет при полном перезапуске кластера?

---

## Задание 9. Хранилище, которое переживает ноду

local-path кладёт данные на диск конкретной ноды, и PV получает `nodeAffinity` к ней.

**Сначала посмотри на проблему**

```bash
kubectl get pv -o yaml | grep -A6 nodeAffinity
```

Выключи ноду, где лежит том Postgres. Что с подом `postgres-0`? Почему StatefulSet не пересоздаёт его на другой ноде
даже спустя 10 минут? (Подсказка: гарантия «не больше одного пода с этим именем».)

**Сделать** — выбери один путь:

- **A. NFS.** На k3s-4 подними NFS-сервер, поставь `nfs-subdir-external-provisioner` (helm), получи StorageClass `nfs` с `ReadWriteMany`.
  На всех нодах нужен `nfs-common`. Минус: k3s-4 теперь единая точка отказа хранилища.
- **B. Longhorn.** Распределённое блочное хранилище с репликами на нескольких нодах.
  Нужны `open-iscsi` (и `nfs-common` для RWX) на всех нодах; минимум 4 ГБ RAM на ноду — проверь, хватает ли.

Перенеси на новый StorageClass том с фото товаров (он должен стать `ReadWriteMany`).
Postgres можно оставить на local-path, но прибить к конкретной ноде осознанно (см. задание 10).

**Проверка:** загрузи фото через админку, выключи ноду с подом приложения, дождись переезда — фото на месте.

---

## Задание 10. Планирование подов

**Сделать**

1. Повесь на k3s-1..3 метку `node-role=control`, на k3s-4 — `node-role=worker`.
2. Postgres — через `nodeAffinity` на конкретную ноду (ту, где его local-path том).
3. Приложение — `replicas: 2`, и чтобы реплики **всегда** были на разных нодах
   (`podAntiAffinity` или `topologySpreadConstraints` — попробуй оба, сравни).
4. `PodDisruptionBudget` для приложения: `minAvailable: 1`.
5. **Бонус:** taint на серверы `CriticalAddonsOnly=true:NoExecute` — рабочая нагрузка только на агенте.
   Что сломалось и почему? Как это лечится, когда воркер один?

**Проверка**

```bash
kubectl -n ecocraft get pod -o wide   # реплики app на разных нодах
```

**Вопрос себе:** при `replicas: 2` оба пода на старте запускают `prisma migrate deploy` одновременно.
Это безопасно? Посмотри, как Prisma защищается от параллельных миграций, и реши, оставить так или вынести миграции в `Job`.

---

## Задание 11. Обслуживание и аварии

**11.1. Плановое обслуживание.**

```bash
kubectl drain k3s-2 --ignore-daemonsets --delete-emptydir-data
```

Магазин доступен во время drain? Как PDB повлиял на выселение? Обнови пакеты на k3s-2, перезагрузи, `kubectl uncordon`.
Поды сами вернулись на k3s-2? Почему нет?

**11.2. Внезапная смерть ноды.** Power Off в VMware на ноде с подом приложения. Засеки:
- через сколько нода стала `NotReady`;
- через сколько под пересоздан на другой ноде (подсказка: дефолтные tolerations `node.kubernetes.io/unreachable` — 300 секунд).

Уменьши это время для приложения через `tolerationSeconds` и повтори замер.

**11.3. Бэкап etcd.**

```bash
sudo k3s etcd-snapshot save --name before-chaos
sudo k3s etcd-snapshot ls
```

Удали namespace `ecocraft`. Восстанови кластер из снапшота (`--cluster-reset --cluster-reset-restore-path`)
по документации k3s. Namespace вернулся? А данные Postgres — почему нет (или да)?

**11.4. Обновление k3s** без простоя: по одному серверу, затем агент. Бонус — `system-upgrade-controller`.

---

## Финальный чек-лист части 2

- [ ] 4 ноды `Ready`, 3 из них — control-plane с etcd
- [ ] Выключение любой **одной** VM не роняет ни API, ни магазин (после переезда подов)
- [ ] Образы тянутся из своего registry, никаких ручных `ctr import`
- [ ] Фото товаров не пропадают при переезде пода на другую ноду
- [ ] Есть снапшот etcd и проверенная процедура восстановления
- [ ] Можешь объяснить, почему серверов 3, а не 4
