# Урок 4. Service и DNS

## Теория

У pods меняются IP. **Service** — стабильный виртуальный IP + DNS-имя, который балансирует на pods, подходящие под `selector` и находящиеся в состоянии Ready.

Типы:

- `ClusterIP` (по умолчанию) — доступен только внутри кластера.
- `NodePort` — открывает порт 30000–32767 на каждой ноде.
- `LoadBalancer` — во внешнем облаке создаёт балансировщик; в k3s это делает ServiceLB (занимает порт на нодах).
- `ExternalName` — DNS-алиас на внешний хост.
- Headless (`clusterIP: None`) — без VIP, DNS отдаёт IP самих pods (нужен для StatefulSet).

Под капотом: `kube-proxy` / правила iptables (или nftables) на каждой ноде + **Endpoints/EndpointSlice** — список реальных IP pods.

## Практика

Подготовь Deployment из урока 3 (3 реплики `web`).

`~/k8s-lab/svc.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
```

```bash
kubectl apply -f deploy.yaml -f svc.yaml
kubectl get svc web
kubectl get endpoints web          # IP живых pods
kubectl get pods -l app=web -o wide   # сравни IP
```

### 4.1 Доступ изнутри кластера и DNS

```bash
kubectl run tmp --rm -it --image=curlimages/curl --restart=Never -- sh
# внутри:
curl -s web
curl -s web.default.svc.cluster.local | head -5
nslookup web           # (если нет nslookup: используй busybox)
cat /etc/resolv.conf
exit
```

Формат имени: `<service>.<namespace>.svc.cluster.local`. Короткое имя `web` работает внутри того же namespace благодаря `search` в `resolv.conf`.

### 4.2 Балансировка

Чтобы видеть, какой pod отвечает, сделай каждому свою страницу:

```bash
for p in $(kubectl get pods -l app=web -o name); do
  kubectl exec $p -- sh -c 'echo "I am $(hostname)" > /usr/share/nginx/html/index.html'
done
kubectl run tmp --rm -it --image=curlimages/curl --restart=Never -- \
  sh -c 'for i in 1 2 3 4 5 6; do curl -s web; done'
```

Ответы будут от разных pods.

### 4.3 NodePort

```bash
kubectl patch svc web -p '{"spec":{"type":"NodePort"}}'
kubectl get svc web           # порт вида 80:3xxxx/TCP
curl http://<IP-ноды>:3xxxx
```

### 4.4 Что происходит, когда pod не Ready

```bash
kubectl get endpoints web -w &
kubectl delete pod -l app=web
```

Наблюдай: из endpoints пропадают умершие IP, добавляются новые.

### 4.5 Неправильный selector — классика багов

```bash
kubectl patch svc web -p '{"spec":{"selector":{"app":"wrong"}}}'
kubectl get endpoints web          # <none>
kubectl run tmp --rm -it --image=curlimages/curl --restart=Never -- curl -m 3 web
```

Сервис есть, а ответа нет. Диагностика всегда: `kubectl get endpoints`. Верни: `app=web`.

## Задания

1. Измени `port` на 8080, оставив `targetPort: 80`. Проверь `curl web:8080`.
2. Дай порту имя в Deployment (`name: http`) и ссылайся на него в Service через `targetPort: http`.
3. Создай headless Service (`clusterIP: None`) и посмотри через `nslookup`, что DNS вернул несколько A-записей.
4. Создай pod в namespace `other` и обратись к сервису по `web.default`.

## Сломай и почини

Убей CoreDNS: `kubectl -n kube-system scale deploy coredns --replicas=0`. Проверь, что `curl web` перестал работать по имени, но работает по ClusterIP. Верни `--replicas=1`. Вывод: DNS — отдельная зависимость.

## Очистка

```bash
kubectl delete -f svc.yaml -f deploy.yaml
```

## Контрольные вопросы

- Почему ClusterIP не пингуется (а curl на порт работает)?
- Из чего собирается список endpoints?
- В чём разница `port`, `targetPort`, `nodePort`?
