# Урок 3. Deployment

## Теория

**Deployment** управляет набором одинаковых pods через **ReplicaSet**.

```
Deployment → ReplicaSet (по одному на версию) → Pods
```

Он даёт: нужное число реплик, самолечение, плавные обновления (rolling update), откат.

Связь по **меткам (labels)**: `selector` Deployment ищет pods с нужным label. Это основной механизм связи в Kubernetes — запомни.

## Практика

`~/k8s-lab/deploy.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.26
          ports:
            - containerPort: 80
```

```bash
kubectl apply -f deploy.yaml
kubectl get deploy,rs,pods -l app=web
```

### 3.1 Самолечение

В одном терминале: `kubectl get pods -l app=web -w`
В другом: `kubectl delete pod <имя-любого-пода>`
Появился новый — это работа ReplicaSet-контроллера.

### 3.2 Масштабирование

```bash
kubectl scale deploy web --replicas=5
kubectl get pods -l app=web
kubectl scale deploy web --replicas=2
```

(В реальности лучше менять `replicas` в YAML и `apply`.)

### 3.3 Rolling update

```bash
kubectl set image deploy/web nginx=nginx:1.27
kubectl rollout status deploy/web
kubectl get rs -l app=web        # старый RS на 0, новый на N
```

Лучше — изменить `image` в YAML и `kubectl apply -f`. Наблюдай через `get pods -w`, как старые убиваются, а новые поднимаются порциями по `maxSurge`/`maxUnavailable`.

### 3.4 История и откат

```bash
kubectl rollout history deploy/web
kubectl rollout undo deploy/web
kubectl rollout history deploy/web --revision=2
```

### 3.5 Неудачное обновление

```bash
kubectl set image deploy/web nginx=nginx:nonexistent
kubectl rollout status deploy/web --timeout=30s
kubectl get pods -l app=web
```

Заметь: часть старых pods **живы** — rolling update не убил рабочую версию, пока новая не стала Ready. Откатись: `kubectl rollout undo deploy/web`.

### 3.6 Метки и селекторы

```bash
kubectl get pods --show-labels
kubectl get pods -l app=web
kubectl label pod <pod> debug=true
kubectl get pods -l debug=true
```

## Задания

1. Поставь `strategy: Recreate`, обнови образ — что происходит со всеми pods одновременно?
2. Поставь `maxUnavailable: 0`, `maxSurge: 1` — как изменилось поведение?
3. Убери label `app=web` с одного pod командой `kubectl label pod X app-`. Что сделал ReplicaSet? (создал новый, а «осиротевший» pod остался жить без хозяина).
4. Создай в `deploy.yaml` несоответствие: `selector: app: web`, а в template `labels: app: other`. Прочитай ошибку.

## Сломай и почини

Поставь `replicas: 1000` на 1 ноде 2 ГБ. Посмотри, как много pods `Pending` и почему (`describe pod` → `Insufficient cpu/memory` или лимит 110 pods на ноду). Верни разумное число.

## Очистка

```bash
kubectl delete -f deploy.yaml
```

## Контрольные вопросы

- Зачем нужен ReplicaSet между Deployment и Pod?
- Что случится с трафиком при обновлении, если `maxUnavailable: 0`?
- Как Deployment «находит» свои pods?
