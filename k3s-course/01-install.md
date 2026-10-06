# Урок 1. Установка k3s и архитектура

## Теория

**Kubernetes** — система, которая держит желаемое состояние: ты описываешь «хочу 3 копии приложения», а кластер постоянно сравнивает желаемое с реальным и исправляет разницу (control loop).

Компоненты:

- **Control plane** (мозг):
  - `kube-apiserver` — единственная точка входа, REST API. Всё (kubectl, kubelet, контроллеры) общается через него.
  - `etcd` — хранилище состояния (в k3s по умолчанию SQLite, опционально встроенный etcd).
  - `scheduler` — решает, на какую ноду посадить pod.
  - `controller-manager` — набор контроллеров (Deployment, Node, Job…).
- **Node** (рабочая лошадь): `kubelet` (запускает контейнеры), container runtime (в k3s — `containerd`), `kube-proxy` (сеть сервисов).

**k3s** — облегчённый дистрибутив Kubernetes: один бинарник ~70 МБ, всё control plane в одном процессе `k3s server`. Из коробки идут:
Traefik (ingress), CoreDNS, local-path-provisioner (storage), metrics-server, ServiceLB (klipper), Flannel (сеть).

## Практика

### 1.1 Установка

```bash
curl -sfL https://get.k3s.io | sh -
```

Проверка:

```bash
sudo systemctl status k3s
sudo k3s kubectl get nodes
```

Нода должна быть `Ready`. Установился также `kubectl` (симлинк на k3s).

### 1.2 kubeconfig

Конфиг лежит в `/etc/rancher/k3s/k3s.yaml` (читается только root). Чтобы работать без sudo:

```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER ~/.kube/config
export KUBECONFIG=~/.kube/config
kubectl get nodes -o wide
```

Открой файл `~/.kube/config`: там `cluster` (адрес API, CA), `user` (клиентский сертификат) и `context` (связка).

```bash
kubectl config get-contexts
kubectl cluster-info
```

### 1.3 Что уже работает в кластере

```bash
kubectl get pods -A
kubectl get svc -A
kubectl get ns
```

Найди и объясни себе: что такое `coredns`, `traefik`, `local-path-provisioner`, `metrics-server`.
Они лежат в namespace `kube-system`.

### 1.4 Где живёт k3s на диске

```bash
ls /var/lib/rancher/k3s/server/       # данные control plane
ls /var/lib/rancher/k3s/server/manifests/   # автоприменяемые манифесты (Traefik и др.)
sudo ls /var/lib/rancher/k3s/agent/containerd/
sudo k3s crictl ps                    # контейнеры на уровне runtime
```

Заметь: `docker ps` не покажет ничего — runtime здесь containerd.

### 1.5 Научись пользоваться справкой

```bash
kubectl api-resources            # все типы объектов
kubectl explain pod.spec.containers
kubectl explain deployment.spec --recursive | head -50
```

`kubectl explain` — встроенная документация по каждому полю YAML. Пользуйся постоянно.

## Задания

1. Выведи версию Kubernetes и k3s: `kubectl version`, `k3s --version`.
2. Узнай IP-адрес API-сервера и порт (должен быть 6443): `sudo ss -tlnp | grep k3s`.
3. Найди 3 процесса, относящихся к k3s: `ps aux | grep -E 'k3s|containerd'`.
4. С помощью `kubectl get pods -n kube-system -o wide` определи, на какой ноде и с каким IP работает CoreDNS.

## Сломай и почини

Останови k3s: `sudo systemctl stop k3s`, затем `kubectl get nodes`.
Что за ошибка? Почему? Запусти обратно и убедись, что **ранее созданные pods вернулись** — состояние хранится на диске.

## Контрольные вопросы

- Какой компонент единственный общается с хранилищем состояния?
- Чем k3s отличается от «полного» Kubernetes?
- Зачем нужен kubeconfig и что в нём лежит?

## Удаление (когда закончишь всё обучение)

```bash
/usr/local/bin/k3s-uninstall.sh
```
