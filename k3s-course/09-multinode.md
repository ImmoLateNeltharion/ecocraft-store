# Урок 9. Несколько нод

> Нужна вторая машина/ВМ (например `multipass launch --name k3s-2 -c 2 -m 2G`). Ноды должны видеть друг друга по сети; открыты порты: 6443/tcp (API), 8472/udp (VXLAN flannel), 10250/tcp (kubelet).

## Теория

- **server** — control plane (+ работает и как worker по умолчанию).
- **agent** — только worker.
- Агент подключается по токену, который лежит на сервере.

Один server — это единая точка отказа control plane. HA в k3s делается через 3 сервера + встроенный etcd (`--cluster-init`) — это тема для следующего шага.

## Практика

### 9.1 Присоединение агента

На сервере:

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
hostname -I
```

На второй машине:

```bash
curl -sfL https://get.k3s.io | \
  K3S_URL=https://<IP-сервера>:6443 K3S_TOKEN=<токен> sh -
```

Проверка на сервере:

```bash
kubectl get nodes -o wide
kubectl label node <имя-агента> node-role.kubernetes.io/worker=worker
```

### 9.2 Распределение pods

```bash
kubectl create deployment spread --image=nginx:1.27 --replicas=6
kubectl get pods -l app=spread -o wide
```

Scheduler размазал pods по нодам по ресурсам.

### 9.3 Сеть между нодами

```bash
kubectl get pods -l app=spread -o wide     # возьми IP pod на другой ноде
kubectl run tmp --rm -it --image=curlimages/curl --restart=Never -- curl -m 3 <IP-пода>
```

Pod-IP достижим из любой ноды — это работа overlay-сети Flannel (VXLAN).

### 9.4 nodeSelector и affinity

```bash
kubectl label node <агент> disk=ssd
```

```yaml
spec:
  template:
    spec:
      nodeSelector:
        disk: ssd
```

Проверь, что все pods приехали на агента. Затем замени на `nodeAffinity` (`preferredDuringSchedulingIgnoredDuringExecution`) и посмотри «мягкое» предпочтение.

### 9.5 Taints и tolerations

Taint «отталкивает» pods:

```bash
kubectl taint nodes <сервер> dedicated=infra:NoSchedule
kubectl rollout restart deploy spread
kubectl get pods -l app=spread -o wide     # новые — только на агенте
```

Разреши отдельному workload:

```yaml
tolerations:
  - key: dedicated
    operator: Equal
    value: infra
    effect: NoSchedule
```

Сними taint: `kubectl taint nodes <сервер> dedicated-`.

### 9.6 Spread по нодам

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector: { matchLabels: { app: spread } }
```

### 9.7 Обслуживание ноды: cordon / drain

```bash
kubectl cordon <агент>      # новые pods не планируются
kubectl drain <агент> --ignore-daemonsets --delete-emptydir-data
kubectl get pods -o wide    # всё переехало на сервер
kubectl uncordon <агент>
```

### 9.8 Падение ноды

Выключи агента (`sudo poweroff`). Наблюдай:

```bash
kubectl get nodes -w          # NotReady через ~40 с
kubectl get pods -o wide -w   # pods эвакуируются через ~5 мин (tolerationSeconds=300)
```

Pods Deployment пересоздадутся на живой ноде. Pods с local-path PVC **не переедут** — данные остались на упавшей ноде.

### 9.9 DaemonSet

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata: { name: ds-demo }
spec:
  selector: { matchLabels: { app: ds-demo } }
  template:
    metadata: { labels: { app: ds-demo } }
    spec:
      containers:
        - { name: c, image: busybox, command: ["sleep","3600"] }
```

По одному pod на ноду (так работают агенты логов/мониторинга; в k3s — `svclb` и др.).

## Задания

1. Сделай так, чтобы pods приложения никогда не оказывались на одной ноде (`podAntiAffinity`).
2. Добавь ноду, затем выведи её из кластера корректно: `drain` → `kubectl delete node` → на ноде `k3s-agent-uninstall.sh`.
3. Выясни, на какой ноде запущен Traefik и что будет, если эта нода упадёт.

## Сломай и почини

Закрой на сервере порт 8472/udp файрволом (`sudo iptables -I INPUT -p udp --dport 8472 -j DROP`). Pods на разных нодах перестанут видеть друг друга, хотя ноды `Ready`. Диагностируй, убери правило.

## Контрольные вопросы

- Чем taint отличается от nodeSelector?
- Что делает `drain` и чем он отличается от `cordon`?
- Почему local-path плохо дружит с отказом ноды?
