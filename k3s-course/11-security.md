# Урок 11. Namespaces, RBAC, NetworkPolicy

## Теория

- **Namespace** — логическое разделение ресурсов, имён, квот.
- **RBAC** — кто (subject) что (verbs) над чем (resources) может делать. `Role`/`ClusterRole` описывают права; `RoleBinding`/`ClusterRoleBinding` привязывают к пользователю/группе/ServiceAccount.
- **ServiceAccount** — идентичность pod'а для обращения к API.
- **NetworkPolicy** — файрвол на уровне pods. По умолчанию всё разрешено; как только на pod повесили политику — разрешено лишь явно перечисленное. В k3s политики исполняет встроенный kube-router netpol-контроллер.

## Практика

### 11.1 Namespaces

```bash
kubectl create ns team-a
kubectl create ns team-b
kubectl -n team-a create deploy web --image=nginx:1.27
kubectl -n team-a expose deploy web --port=80
kubectl get pods -A | grep web
kubectl config set-context --current --namespace=team-a   # пространство по умолчанию
```

Межнамеспейсный доступ: `web.team-a.svc.cluster.local` из `team-b` работает — изоляции по сети нет, пока нет NetworkPolicy.

### 11.2 Квоты

```yaml
apiVersion: v1
kind: ResourceQuota
metadata: { name: q, namespace: team-a }
spec:
  hard:
    pods: "5"
    requests.cpu: "1"
    requests.memory: 1Gi
```

```bash
kubectl -n team-a scale deploy web --replicas=10
kubectl -n team-a get deploy web          # 5/10
kubectl -n team-a describe rs | tail      # forbidden: exceeded quota
```

### 11.3 ServiceAccount и RBAC

```bash
kubectl -n team-a create sa viewer
kubectl -n team-a create role pod-reader --verb=get,list,watch --resource=pods
kubectl -n team-a create rolebinding viewer-rb --role=pod-reader --serviceaccount=team-a:viewer
```

Проверка прав без входа под этим пользователем:

```bash
kubectl auth can-i list pods -n team-a --as=system:serviceaccount:team-a:viewer     # yes
kubectl auth can-i delete pods -n team-a --as=system:serviceaccount:team-a:viewer   # no
kubectl auth can-i list pods -n team-b --as=system:serviceaccount:team-a:viewer     # no
```

### 11.4 Pod, ходящий в API

```bash
kubectl -n team-a run api-test --image=curlimages/curl --overrides='{"spec":{"serviceAccountName":"viewer"}}' --command -- sleep 3600
kubectl -n team-a exec api-test -- sh -c '
  TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
  curl -sk -H "Authorization: Bearer $TOKEN" https://kubernetes.default.svc/api/v1/namespaces/team-a/pods | head -20
  echo ---
  curl -sk -H "Authorization: Bearer $TOKEN" https://kubernetes.default.svc/api/v1/namespaces/team-a/secrets | head'
```

Pods видишь, секреты — `Forbidden`. Токен автоматически смонтирован в каждый pod (`automountServiceAccountToken: false` отключает).

### 11.5 Отдельный пользователь с kubeconfig (бонус)

Создай ServiceAccount-токен и собери из него kubeconfig:

```bash
kubectl -n team-a create token viewer --duration=1h
```

Подставь в `kubectl --token=<...> get pods -n team-a`.

### 11.6 NetworkPolicy

Тестовый клиент в другом namespace:

```bash
kubectl -n team-b run client --image=curlimages/curl --command -- sleep 3600
kubectl -n team-b exec client -- curl -s -m 3 web.team-a | head -3   # работает
```

Запретить входящий трафик по умолчанию:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: deny-all, namespace: team-a }
spec:
  podSelector: {}
  policyTypes: [Ingress]
```

```bash
kubectl apply -f deny.yaml
kubectl -n team-b exec client -- curl -s -m 3 web.team-a    # timeout
```

Теперь разреши только свой namespace и Traefik:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-same-ns, namespace: team-a }
spec:
  podSelector: {}
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector: {}
```

Проверь: из `team-a` — работает, из `team-b` — нет.

### 11.7 securityContext

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities: { drop: ["ALL"] }
```

Примени к pod'у `busybox` и посмотри, что нельзя писать в `/`. Для nginx понадобятся `emptyDir` на `/var/cache/nginx` и `/var/run`.

## Задания

1. Выдай `viewer` право читать pods во **всех** namespaces (ClusterRole + ClusterRoleBinding).
2. Напиши NetworkPolicy на egress: pod может ходить только в DNS (53/UDP) и один Service.
3. Включи Pod Security Admission: `kubectl label ns team-a pod-security.kubernetes.io/enforce=restricted` и попробуй запустить `nginx` — прочитай отказ.

## Сломай и почини

Примени `deny-all` на **Egress** без разрешения DNS — приложения «внезапно» не резолвят имена. Добавь разрешение на 53 к `kube-system`.

## Очистка

```bash
kubectl delete ns team-a team-b
kubectl config set-context --current --namespace=default
```

## Контрольные вопросы

- Чем Role отличается от ClusterRole?
- Почему pod по умолчанию может обращаться к API?
- Что значит «NetworkPolicy — это allow-list»?
