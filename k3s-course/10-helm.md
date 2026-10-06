# Урок 10. Helm

## Теория

**Helm** — менеджер пакетов для Kubernetes. **Chart** = шаблоны YAML + `values.yaml`. **Release** = установленный экземпляр chart'а в кластере, с историей ревизий и откатом.

В k3s есть встроенный Helm-контроллер (CRD `HelmChart`), но клиент `helm` ставим сами.

## Практика

### 10.1 Установка

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
export KUBECONFIG=~/.kube/config
```

### 10.2 Готовый chart

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo nginx
helm show values bitnami/nginx | head -80
```

```bash
helm install my-nginx bitnami/nginx \
  --set service.type=ClusterIP \
  --set replicaCount=2
helm list
kubectl get all -l app.kubernetes.io/instance=my-nginx
```

Через файл значений (лучше, чем `--set`):

```yaml
# values.yaml
replicaCount: 3
service:
  type: ClusterIP
```

```bash
helm upgrade my-nginx bitnami/nginx -f values.yaml
helm history my-nginx
helm rollback my-nginx 1
helm uninstall my-nginx
```

### 10.3 Что реально создаётся

```bash
helm template my-nginx bitnami/nginx -f values.yaml | less
```

`helm template` показывает итоговый YAML, не обращаясь к кластеру.

### 10.4 Свой chart

```bash
helm create mychart
tree mychart
```

Структура: `Chart.yaml`, `values.yaml`, `templates/` (deployment, service, ingress, `_helpers.tpl`).

Открой `templates/deployment.yaml` и найди конструкции `{{ .Values.replicaCount }}`, `{{ include "mychart.fullname" . }}`.

```bash
helm lint mychart
helm install demo ./mychart --dry-run --debug | head -60
helm install demo ./mychart --set replicaCount=2
helm upgrade demo ./mychart --set image.tag=1.26
```

Свои правки: добавь в `values.yaml` параметр `greeting` и в `templates/` — ConfigMap, использующий `{{ .Values.greeting }}`.

### 10.5 Встроенный HelmChart k3s (декларативно)

`/var/lib/rancher/k3s/server/manifests/demo-helm.yaml`:

```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChart
metadata:
  name: nginx
  namespace: kube-system
spec:
  repo: https://charts.bitnami.com/bitnami
  chart: nginx
  targetNamespace: default
  valuesContent: |-
    replicaCount: 1
```

k3s сам применит манифест, запустит Job установки.

## Задания

1. Установи `bitnami/redis` в namespace `data` (`--create-namespace -n data`). Найди созданные Service, StatefulSet и PVC.
2. Сделай `helm upgrade` с заведомо неверным образом, затем `helm rollback`.
3. Сравни ревизии: `helm get values`, `helm get manifest --revision N`.

## Сломай и почини

Установи chart с `--set image.tag=nonexistent --wait --timeout 60s` — Helm пометит релиз failed. Разберись с `helm status`, `helm rollback`.

## Очистка

```bash
helm uninstall demo my-nginx 2>/dev/null; helm uninstall -n data redis 2>/dev/null
```

## Контрольные вопросы

- Chart, release, revision — в чём разница?
- Чем `helm template` отличается от `helm install --dry-run`?
- Когда Helm оправдан, а когда достаточно простого YAML (или Kustomize)?
