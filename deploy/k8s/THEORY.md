# Kubernetes с нуля — теория перед практикой

Этот файл читается до `TASKS.md`. Всё объясняется на примере нашего магазина:
ты уже знаешь, как он работает в `docker-compose.yml`, а здесь видно, как то же самое выглядит в Kubernetes.

План:
1. Зачем вообще Kubernetes
2. Из чего состоит кластер
3. Главная идея: желаемое состояние
4. Манифесты и kubectl
5. Основные объекты (по порядку, в котором они понадобятся)
6. Шпаргалка: docker-compose → Kubernetes
7. Как искать проблемы
8. Разминка руками
9. Что почитать

---

## 1. Зачем вообще Kubernetes

Docker Compose запускает контейнеры **на одной машине**. Если машина умерла — умер сайт.
Если контейнер упал, `restart: unless-stopped` его перезапустит, но только на этой же машине.

Kubernetes (k8s, «кубер») управляет контейнерами **на группе машин (кластере)**:
- сам решает, на какой машине запустить контейнер;
- если машина умерла — переносит контейнеры на живые;
- обновляет приложение без простоя (новые копии поднимаются, старые гасятся по одной);
- даёт балансировку, DNS-имена, хранилища, секреты — всё одним стандартным способом.

Цена — больше понятий и больше YAML. Для одного маленького сайта это избыточно,
но для обучения наш магазин подходит идеально: в нём есть база, приложение, тома, секреты и веб-доступ.

**k3s** — это облегчённый Kubernetes одним бинарником. Он «настоящий» (те же API и `kubectl`),
просто сразу включает в себя всё нужное: сеть, DNS, Ingress-контроллер Traefik, простое хранилище local-path.

---

## 2. Из чего состоит кластер

```
                       ┌──────────────── Control plane (сервер) ────────────────┐
  kubectl  ──HTTPS──▶  │  API server  ◀──▶  etcd (база всего состояния)          │
  (ты)                 │      ▲                                                  │
                       │      ├── scheduler            (решает, на какую ноду)   │
                       │      └── controller-manager   (доводит до желаемого)    │
                       └──────┬──────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       ┌─ Нода 1 ─┐      ┌─ Нода 2 ─┐      ┌─ Нода 3 ─┐
       │ kubelet  │      │ kubelet  │      │ kubelet  │   ← агент, запускает контейнеры
       │containerd│      │containerd│      │containerd│   ← как Docker, только без Docker
       │ [pod][pod]│     │  [pod]   │      │[pod][pod]│
       └──────────┘      └──────────┘      └──────────┘
```

- **Нода (node)** — машина в кластере (у тебя — VM).
- **Control plane** — «мозг»: принимает команды, хранит состояние, планирует.
  - **API server** — единственная точка входа. И `kubectl`, и все компоненты общаются только через него.
  - **etcd** — база данных, где хранится всё: какие поды должны быть, какие есть, секреты, конфиги.
  - **scheduler** — выбирает, на какую ноду поставить новый под.
  - **controller-manager** — набор «контроллеров», каждый следит за своим типом объектов.
- **kubelet** — агент на каждой ноде: получает «запусти вот это» и запускает через containerd.
- **containerd** — среда запуска контейнеров. Docker на нодах не нужен, образы те же.

В k3s сервер одновременно может быть и рабочей нодой — поэтому на одной VM работает весь кластер.

---

## 3. Главная идея: желаемое состояние

Это самое важное во всём Kubernetes.

В Docker ты говоришь **что сделать**: «запусти контейнер».
В Kubernetes ты описываешь **как должно быть**: «должно работать 2 копии приложения версии 0.1.0».

Дальше контроллеры бесконечно сравнивают «как должно быть» с «как есть» и устраняют разницу:
- работает 1 копия вместо 2 → запустят ещё одну;
- ты поменял версию на 0.2.0 → постепенно заменят старые копии новыми;
- нода умерла вместе с копией → запустят замену на другой ноде.

Поэтому в Kubernetes почти никогда не «перезапускают» руками. Ты меняешь описание — кластер сам приводит себя в соответствие.
Удалил под руками — он появится снова, потому что «должно быть 2».

---

## 4. Манифесты и kubectl

Всё описывается YAML-файлами — **манифестами**. У любого объекта одна и та же структура:

```yaml
apiVersion: apps/v1          # версия API, к которой относится объект
kind: Deployment             # тип объекта
metadata:
  name: ecocraft-app         # имя
  namespace: ecocraft        # «папка», в которой лежит объект
  labels:                    # метки — произвольные пары ключ=значение
    app: ecocraft-app
spec:                        # желаемое состояние — тут вся суть
  ...
```

После применения у объекта появляется ещё `status` — фактическое состояние, его заполняет кластер.

**Метки (labels) и селекторы** — то, как объекты находят друг друга.
Service не знает подов по именам, он говорит «все поды с меткой `app: ecocraft-app`».
Опечатка в метке — самая частая причина «сервис не видит поды».

**Namespace** — способ разложить объекты по группам. Всё наше будет в `ecocraft`.
Системные вещи k3s живут в `kube-system`.

Основные команды:

```bash
kubectl apply -f file.yaml            # создать или обновить по файлу (главная команда)
kubectl get pods -n ecocraft          # список
kubectl get pods -n ecocraft -o wide  # + на какой ноде, какой IP
kubectl describe pod <имя> -n ecocraft  # подробности + события (Events) внизу — читать первым делом
kubectl logs <под> -n ecocraft        # логи контейнера
kubectl logs <под> --previous         # логи предыдущего, упавшего запуска
kubectl exec -it <под> -n ecocraft -- sh   # зайти внутрь, как docker exec
kubectl delete -f file.yaml           # удалить
kubectl explain deployment.spec       # встроенная документация по любому полю
```

Чтобы не писать `-n ecocraft` каждый раз:
`kubectl config set-context --current --namespace=ecocraft`.

---

## 5. Основные объекты

### Pod — минимальная единица

Под — это один или несколько контейнеров, которые всегда живут вместе на одной ноде, с общим IP и общими томами.
Обычно в поде один контейнер. Можно думать «под ≈ контейнер», с поправкой на это.

Поды **одноразовые**: умер — не воскрешается, вместо него создаётся новый, с новым именем и новым IP.
Поэтому руками поды почти не создают — их создают контроллеры (Deployment, StatefulSet, Job).

Статусы, которые увидишь в `kubectl get pods`:

| Статус | Что значит |
|---|---|
| `Pending` | ещё не назначен на ноду: нет ресурсов или ждёт том |
| `ContainerCreating` | назначен, качается образ / монтируются тома |
| `Running` | работает (но это не значит «готов принимать трафик» — см. probes) |
| `CrashLoopBackOff` | контейнер стартует и падает, кубер ждёт всё дольше перед новой попыткой |
| `ImagePullBackOff` / `ErrImagePull` | не может скачать образ (опечатка, нет доступа, нет registry) |
| `OOMKilled` | превысил лимит памяти и был убит |
| `Completed` | закончил работу успешно (для Job) |

Колонка `READY 1/1` — сколько контейнеров готово из скольки. `RESTARTS` — сколько раз перезапускался.

### Deployment — для приложений без состояния

Ты говоришь: «образ такой-то, копий (replicas) — 2». Deployment следит, чтобы их было ровно 2.
Внутри он создаёт **ReplicaSet**, а тот — поды. Обычно с ReplicaSet напрямую не работаешь.

Что даёт:
- **rolling update** — меняешь образ, поды заменяются постепенно, сайт не падает;
- **rollback** — `kubectl rollout undo deployment/ecocraft-app` возвращает прошлую версию;
- **масштабирование** — `kubectl scale deployment/ecocraft-app --replicas=3`.

Наше Next.js-приложение будет Deployment.

### Service — постоянный адрес для подов

У подов IP меняются при каждом пересоздании. Service даёт **постоянное имя и IP** и балансирует запросы
между всеми подами с нужной меткой.

Типы:
- `ClusterIP` (по умолчанию) — адрес только внутри кластера. Для связи «приложение → база».
- `NodePort` — открывает порт (30000–32767) на каждой ноде, можно зайти снаружи по `IP_ноды:порт`.
- `LoadBalancer` — внешний балансировщик. В облаке его даёт провайдер, в k3s — встроенный ServiceLB.

Внутри кластера работает DNS: Service `postgres` в namespace `ecocraft` доступен по имени
`postgres` (из того же namespace) или `postgres.ecocraft.svc.cluster.local` (откуда угодно).
Это прямой аналог того, как в compose приложение ходит в базу по имени `db`.

### Ingress — вход снаружи по домену

Service типа ClusterIP снаружи не виден. **Ingress** — это правила вида
«запросы на `ecocraft.local` отправляй в сервис `ecocraft-app`», плюс HTTPS.

Сами правила ничего не делают — их исполняет **Ingress-контроллер**. В k3s это **Traefik**, он уже установлен.
В нашем compose эту роль играет nginx.

Путь запроса:
```
браузер → IP ноды:80 → Traefik → Ingress-правило → Service ecocraft-app → один из подов :3000
```

### ConfigMap и Secret — настройки

Аналог переменных окружения из `.env`.
- **ConfigMap** — несекретное: `NEXT_PUBLIC_SITE_URL`, реквизиты.
- **Secret** — пароли и токены: `POSTGRES_PASSWORD`, `DATABASE_URL`, ключи ЮKassa.

Подключаются к контейнеру как переменные окружения (`env`, `envFrom`) или как файлы.

> Secret хранится в base64 — это **не шифрование**, а просто кодировка. Любой с доступом к кластеру его прочитает.
> Поэтому файлы с секретами в git не коммитят.

### Volumes, PVC, StorageClass — данные, которые не должны пропасть

Файловая система контейнера исчезает вместе с подом. Для данных нужны тома.

- **PersistentVolumeClaim (PVC)** — заявка: «мне нужен диск на 1 ГБ». Это пишешь ты.
- **PersistentVolume (PV)** — сам диск. Обычно создаётся автоматически по заявке.
- **StorageClass** — «откуда брать диски». В k3s есть `local-path`: папка на диске ноды
  (`/var/lib/rancher/k3s/storage/...`).

Режимы доступа:
- `ReadWriteOnce` (RWO) — том подключается к одной ноде. local-path умеет только так.
- `ReadWriteMany` (RWX) — к многим нодам сразу. Нужно сетевое хранилище (NFS, Longhorn).

Это прямой аналог `volumes: pgdata:` из compose. Разница всплывёт на нескольких нодах:
local-path-том физически лежит на одной машине, и под с ним может работать только там.

### StatefulSet — для баз данных

Как Deployment, но для приложений с состоянием:
- стабильные имена подов: `postgres-0`, `postgres-1` (а не случайные);
- у каждого пода свой постоянный том, который не теряется при пересоздании;
- поды запускаются и останавливаются строго по порядку.

Postgres будет StatefulSet. В пару к нему обычно делают **headless Service** (`clusterIP: None`) —
он даёт DNS-имя каждому поду отдельно.

### Probes — проверки здоровья

Kubelet регулярно опрашивает контейнер. Есть три вида, и путать их — классическая ошибка:

| Probe | Вопрос | Если провал |
|---|---|---|
| `startupProbe` | «Ты уже запустился?» | ждёт; пока не прошёл — две другие не работают. Для медленного старта (у нас — миграции) |
| `readinessProbe` | «Ты готов принимать запросы?» | под убирается из Service, трафик на него не идёт. **Не перезапускается** |
| `livenessProbe` | «Ты вообще жив, не завис?» | контейнер **убивается и перезапускается** |

Аналог — `healthcheck` из compose, только там он один и ничего не перезапускает.

Правило: liveness должен проверять **только сам процесс**, а не его зависимости.
Иначе упадёт база — и кубер начнёт бессмысленно перезапускать все приложения.
Это напрямую касается нашего `/api/health`, который проверяет ещё и базу — в задании 3 к этому вернёмся.

### Resources — requests и limits

```yaml
resources:
  requests: { cpu: 100m, memory: 256Mi }   # гарантированный минимум; по нему scheduler выбирает ноду
  limits:   { memory: 512Mi }              # потолок; при превышении памяти — OOMKilled
```

`100m` — 0.1 ядра. `Mi` — мебибайты. Без requests scheduler не знает, сколько ресурсов нужно поду,
и может набить ноду до отказа.

### initContainers — подготовка перед стартом

Контейнеры, которые выполняются **до** основного и должны завершиться успешно.
Например: «жди, пока база не начнёт отвечать». Аналог `depends_on: condition: service_healthy` из compose,
которого в Kubernetes как такового нет.

### Job и CronJob — разовые и регулярные задачи

- **Job** — запустить под, дождаться успешного завершения (повторить при ошибке). Например, миграции.
- **CronJob** — создаёт Job по расписанию (синтаксис cron). Например, ночной бэкап базы — аналог `deploy/backup.sh`.

### Размещение подов (понадобится в части 2)

- **nodeSelector / nodeAffinity** — «ставь этот под только на ноды с такой меткой».
- **podAntiAffinity / topologySpreadConstraints** — «не ставь две копии на одну ноду».
- **taints и tolerations** — нода «отталкивает» поды, кроме тех, что явно это терпят.
- **PodDisruptionBudget** — «при плановом обслуживании не гаси больше N копий сразу».

### Kustomize (понадобится в задании 5)

Встроенный в `kubectl` способ собрать кучу YAML-файлов в один набор: `kubectl apply -k папка/`.
Умеет генерировать Secret из файла, менять тег образа и т.п. без шаблонов.

---

## 6. Шпаргалка: docker-compose → Kubernetes

| docker-compose.yml | Kubernetes |
|---|---|
| `services.db` | StatefulSet `postgres` + headless Service |
| `services.app` | Deployment `ecocraft-app` + Service |
| `services.nginx` (порты 80/443) | Ingress + Traefik (уже есть в k3s) |
| `services.certbot` | cert-manager (бонус в задании 4) |
| `image:` / `build:` | `image:` в манифесте; собирать образ — отдельно, кубер не собирает |
| `environment:` из `.env` | ConfigMap + Secret |
| `volumes: pgdata:` | PVC (через `volumeClaimTemplates` у StatefulSet) |
| `volumes: product_images:` | PVC, подключённый к Deployment |
| `healthcheck:` | readinessProbe / livenessProbe / startupProbe |
| `depends_on: service_healthy` | initContainer, который ждёт базу |
| `restart: unless-stopped` | встроено: контроллеры всегда поддерживают нужное число подов |
| имя сервиса как хост (`db`) | DNS-имя Service (`postgres`) |
| `docker compose up -d` | `kubectl apply -f` (или `-k`) |
| `docker compose ps` | `kubectl get pods` |
| `docker compose logs -f app` | `kubectl logs -f deploy/ecocraft-app` |
| `docker compose exec app sh` | `kubectl exec -it deploy/ecocraft-app -- sh` |
| `deploy/backup.sh` по cron на хосте | CronJob |

---

## 7. Как искать проблемы

Почти всегда хватает четырёх шагов по порядку:

1. `kubectl get pods` — какой статус, сколько рестартов.
2. `kubectl describe pod <имя>` — **секция Events в самом низу**. Там написано, почему Pending,
   почему не скачался образ, почему не смонтировался том, почему провалился probe.
3. `kubectl logs <имя>` (и `--previous`, если под перезапускался) — что сказало само приложение.
4. `kubectl get events --sort-by=.lastTimestamp` — все события namespace по времени.

Типичные причины:

| Симптом | Куда смотреть |
|---|---|
| `Pending` | describe → Events: не хватает CPU/памяти, PVC не создался, не подходит ни одна нода |
| `ImagePullBackOff` | имя/тег образа, `imagePullPolicy`, есть ли образ на ноде или в registry |
| `CrashLoopBackOff` | `logs --previous`: ошибка в приложении, нет переменной окружения, база недоступна |
| `Running`, но `READY 0/1` | readinessProbe не проходит: describe → Events |
| сайт не открывается | цепочка по шагам: под готов? → `kubectl get endpoints` у Service не пустой? → Ingress указывает на правильный Service и порт? |
| `Permission denied` при записи в том | пользователь в контейнере не root — нужен `securityContext.fsGroup` |

---

## 8. Разминка руками (до задания 1)

Когда k3s поставлен (задание 0), сделай это на простом nginx — чтобы пощупать всё без нашего приложения.

```yaml
# hello.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 2
  selector:
    matchLabels: { app: hello }
  template:
    metadata:
      labels: { app: hello }
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  selector: { app: hello }
  ports:
    - port: 80
      targetPort: 80
```

Упражнения:

1. `kubectl apply -f hello.yaml`, затем `kubectl get deploy,rs,pods,svc` — найди, как связаны имена Deployment → ReplicaSet → Pod.
2. `kubectl port-forward svc/hello 8080:80` и открой `http://localhost:8080`.
3. Удали один под (`kubectl delete pod <имя>`) и сразу `kubectl get pods -w`. Что произошло и почему?
4. `kubectl scale deploy/hello --replicas=4` → потом обратно на 2.
5. Поменяй образ на `nginx:1.27-alpine-oops` (несуществующий) через `kubectl set image deploy/hello nginx=...`.
   Посмотри `get pods` и `describe`. Почему сайт продолжает работать? Откати: `kubectl rollout undo deploy/hello`.
6. Поменяй в Service `selector` на `app: hellooo` и примени. `kubectl get endpoints hello` — что изменилось? Почему port-forward перестал работать?
7. `kubectl exec -it deploy/hello -- sh`, внутри: `wget -qO- hello` — DNS-имя сервиса работает изнутри кластера.
8. Убери за собой: `kubectl delete -f hello.yaml`.

Если все 8 пунктов понятны — можно переходить к `TASKS.md`, задание 1.

---

## 9. Что почитать

- **Официальное интерактивное введение:** kubernetes.io → Documentation → Tutorials → *Learn Kubernetes Basics*.
  Короткое, с картинками, ровно про Deployment, Service, масштабирование и обновление.
- **Концепции:** kubernetes.io → Documentation → Concepts. Читать разделы по мере надобности:
  Workloads (Pods, Deployments, StatefulSets, Jobs), Services/Ingress, Storage, Configuration.
- **Документация k3s:** docs.k3s.io — установка, HA с встроенным etcd, registries.yaml, бэкап etcd.
- **`kubectl explain`** — встроенный справочник по каждому полю, работает офлайн:
  `kubectl explain pod.spec.containers.readinessProbe`.

Порядок изучения, если по шагам:

1. Разделы 1–4 этого файла → поставить k3s (задание 0).
2. Pod, Deployment, Service → разминка из раздела 8.
3. Образы → задание 1.
4. Secret, PVC, StatefulSet → задание 2.
5. ConfigMap, probes, resources, initContainers → задание 3.
6. Ingress → задание 4.
7. Job/CronJob, Kustomize → задание 5.
8. Всё про ноды и размещение → часть 2.
