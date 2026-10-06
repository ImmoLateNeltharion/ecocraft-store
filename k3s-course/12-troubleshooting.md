# Урок 12. Диагностика

## Алгоритм

Идём **снизу вверх**, смотрим на статусы:

1. `kubectl get pods -o wide` — статус, restarts, нода.
2. `kubectl describe pod X` — **Events** внизу. Чаще всего ответ уже там.
3. `kubectl logs X [-c container] [--previous]` — логи; `--previous` для упавшего контейнера.
4. `kubectl get events --sort-by=.lastTimestamp -A | tail -30`
5. `kubectl get endpoints svc` — есть ли backends.
6. `kubectl exec / kubectl debug` — зайти внутрь.
7. Нода: `kubectl describe node`, `journalctl -u k3s -f` (или `k3s-agent`).

## Таблица симптомов

| Статус | Типичные причины | Где смотреть |
|--------|------------------|--------------|
| `Pending` | нет ресурсов, taint, PVC не привязан, nodeSelector | `describe pod` → Events |
| `ImagePullBackOff` | опечатка в образе/теге, приватный registry, нет интернета | `describe pod` |
| `CrashLoopBackOff` | приложение падает, плохая команда, OOM, плохая liveness | `logs --previous`, `describe` |
| `CreateContainerConfigError` | нет ConfigMap/Secret/ключа | `describe pod` |
| `Running`, но `0/1 Ready` | не проходит readiness | `describe`, endpoint probe |
| `OOMKilled` | лимит памяти | `describe` → Last State |
| `Evicted` | нехватка ресурсов на ноде | `describe pod`, `describe node` |
| `Terminating` вечно | finalizer, нода мертва | `get pod -o yaml` |
| Service не отвечает | пустые endpoints, неверный targetPort, NetworkPolicy | `get endpoints` |
| Ingress 404/502/503 | нет host/path, нет backend | `describe ingress`, логи Traefik |

## Практика: отладка вслепую

### 12.1 Эфемерный debug-контейнер

```bash
kubectl debug -it <pod> --image=busybox --target=<container>
kubectl debug node/<node> -it --image=busybox     # доступ к ноде
```

### 12.2 Универсальный «инструментальный» pod

```bash
kubectl run net --rm -it --image=nicolaka/netshoot -- bash
# внутри: dig, curl, nslookup, tcpdump, ss ...
```

### 12.3 Формат вывода

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,IP:.status.podIP
kubectl get pods --field-selector=status.phase!=Running -A
kubectl get pod X -o yaml | less
```

### 12.4 Логи системы

```bash
sudo journalctl -u k3s -n 100 --no-pager
sudo journalctl -u k3s-agent -n 100 --no-pager   # на агенте
sudo ls /var/lib/rancher/k3s/agent/containerd/containerd.log
kubectl -n kube-system logs deploy/traefik
kubectl -n kube-system logs deploy/coredns
```

## Лабораторная: «Ремонтная мастерская»

Применяй каждый сломанный манифест, находи причину **только через команды диагностики**, чини.

**Баг 1**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: bug1 }
spec:
  replicas: 1
  selector: { matchLabels: { app: bug1 } }
  template:
    metadata: { labels: { app: bug1 } }
    spec:
      containers:
        - name: c
          image: nginx:1.27-nonexist
```

**Баг 2**

```yaml
apiVersion: v1
kind: Pod
metadata: { name: bug2 }
spec:
  containers:
    - name: c
      image: busybox
      command: ["sh", "-c", "echo start; cat /config/app.conf"]
      volumeMounts: [{ name: cfg, mountPath: /config }]
  volumes:
    - name: cfg
      configMap: { name: missing-cm }
```

**Баг 3**

```yaml
apiVersion: v1
kind: Pod
metadata: { name: bug3, labels: { app: bug3 } }
spec:
  containers:
    - name: c
      image: nginx:1.27
      resources:
        requests: { cpu: "64" }
---
apiVersion: v1
kind: Service
metadata: { name: bug3 }
spec:
  selector: { app: bug3 }
  ports: [{ port: 80, targetPort: 8080 }]
```

(два бага: pod не планируется, а если запустится — неверный targetPort)

**Баг 4**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: bug4 }
spec:
  replicas: 2
  selector: { matchLabels: { app: bug4 } }
  template:
    metadata: { labels: { app: bug4 } }
    spec:
      containers:
        - name: c
          image: nginx:1.27
          livenessProbe:
            httpGet: { path: /health, port: 80 }
            periodSeconds: 2
            failureThreshold: 1
```

**Баг 5** — DNS: `kubectl -n kube-system scale deploy coredns --replicas=0`; найди, почему «ничего не работает» по именам, и почини.

## Чек-лист «поймал новичка»

- Забыл namespace (`-n`), смотришь не туда.
- Не совпали labels/selectors.
- `latest` без `imagePullPolicy` — кэш на ноде.
- YAML: пробелы, `-` в списках, `"true"` vs `true`.
- Изменил ConfigMap — pods не перезапустились.
- Образ для другой архитектуры (arm/amd64) → `exec format error`.

## Контрольные вопросы

- С чего начинается диагностика pod, застрявшего в Pending?
- Как увидеть логи контейнера, который только что упал?
- Как отличить проблему приложения от проблемы сети кластера?
