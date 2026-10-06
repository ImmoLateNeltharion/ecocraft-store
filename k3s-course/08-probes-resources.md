# Урок 8. Probes и ресурсы

## Теория

**Probes** — проверки здоровья, которые выполняет kubelet:

- `startupProbe` — приложение ещё запускается (пока не прошла, остальные отключены).
- `readinessProbe` — готов ли принимать трафик. Не прошла → pod убирается из Endpoints, но **не** перезапускается.
- `livenessProbe` — жив ли процесс. Не прошла → контейнер перезапускают.

**Resources**:

- `requests` — сколько гарантируется; по нему scheduler выбирает ноду.
- `limits` — потолок. CPU: троттлится. Память: превысил → `OOMKilled`.

**QoS-классы**: `Guaranteed` (requests = limits), `Burstable`, `BestEffort` (ничего не задано; убиваются первыми при нехватке памяти).

## Практика

### 8.1 Readiness

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: probe-demo }
spec:
  replicas: 2
  selector: { matchLabels: { app: probe-demo } }
  template:
    metadata: { labels: { app: probe-demo } }
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          readinessProbe:
            httpGet: { path: /ready, port: 80 }
            periodSeconds: 3
          livenessProbe:
            httpGet: { path: /, port: 80 }
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata: { name: probe-demo }
spec:
  selector: { app: probe-demo }
  ports: [{ port: 80 }]
```

```bash
kubectl apply -f probe.yaml
kubectl get pods -l app=probe-demo      # READY 0/1 — /ready возвращает 404
kubectl get endpoints probe-demo        # пусто!
```

Сделай pod готовым:

```bash
P=$(kubectl get pod -l app=probe-demo -o name | head -1)
kubectl exec $P -- sh -c 'echo ok > /usr/share/nginx/html/ready'
kubectl get pods -l app=probe-demo      # один стал 1/1
kubectl get endpoints probe-demo        # IP появился
```

### 8.2 Liveness

Сломай: удали index.html — nginx вернёт 403/404, liveness упадёт, контейнер перезапустится:

```bash
kubectl exec $P -- rm /usr/share/nginx/html/index.html
kubectl get pods -l app=probe-demo -w   # RESTARTS растёт
kubectl describe pod ${P#pod/} | tail -15
```

После рестарта файл вернётся (новый контейнер — чистая файловая система).

### 8.3 Ресурсы и OOM

```yaml
apiVersion: v1
kind: Pod
metadata: { name: oom }
spec:
  containers:
    - name: c
      image: polinux/stress
      command: ["stress", "--vm", "1", "--vm-bytes", "200M", "--vm-hang", "1"]
      resources:
        requests: { memory: 50Mi, cpu: 100m }
        limits:   { memory: 100Mi, cpu: 200m }
```

```bash
kubectl apply -f oom.yaml
kubectl get pod oom -w                # OOMKilled → CrashLoopBackOff
kubectl describe pod oom | grep -A5 "Last State"
kubectl get pod oom -o jsonpath='{.status.qosClass}'
```

### 8.4 Метрики

```bash
kubectl top nodes
kubectl top pods -A
```

(Работает благодаря встроенному metrics-server.)

### 8.5 Pending из-за requests

```yaml
resources: { requests: { memory: 100Gi } }
```

Pod `Pending`, в событиях: `Insufficient memory`. Scheduler смотрит на **requests**, а не на реальное потребление.

### 8.6 Autoscaling (бонус)

```bash
kubectl autoscale deploy probe-demo --cpu-percent=50 --min=2 --max=5
kubectl get hpa
```

Требует `requests.cpu` в pod. Нагрузи: `kubectl run load --rm -it --image=busybox -- sh -c "while true; do wget -q -O- http://probe-demo; done"`.

## Задания

1. Добавь `startupProbe` для медленного приложения (`sleep 30` перед стартом) — убедись, что liveness не убивает его раньше времени.
2. Сделай Guaranteed-pod и сравни QoS.
3. Сделай LimitRange с дефолтными requests/limits в namespace.

## Сломай и почини

Поставь liveness с `periodSeconds: 1`, `failureThreshold: 1`, путь `/nonexistent` — контейнер будет перезапускаться бесконечно. Объясни, как это ломает прод, если liveness проверяет зависимость (БД), а не сам процесс.

## Очистка

```bash
kubectl delete -f probe.yaml
kubectl delete pod oom
kubectl delete hpa --all
```

## Контрольные вопросы

- Что делает kubelet при неудачной readiness и при неудачной liveness?
- Почему `limits.memory` жёсткий, а `limits.cpu` — нет?
- Для чего нужен startupProbe?
