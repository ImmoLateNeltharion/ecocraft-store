# Урок 5. Ingress (Traefik)

## Теория

Service типа NodePort/LoadBalancer — это L4 (TCP). Для HTTP-маршрутизации по хосту и пути используют **Ingress** — правила, которые исполняет **Ingress Controller**. В k3s это **Traefik**, он уже установлен и слушает 80/443 на нодах (через ServiceLB).

```
клиент → :80 ноды → Traefik → (по Host и path) → Service → Pods
```

## Практика

### 5.1 Проверка Traefik

```bash
kubectl -n kube-system get pods,svc | grep traefik
curl -i http://localhost       # 404 page not found — это ответ Traefik, маршрутов нет
```

### 5.2 Два приложения

```bash
kubectl create deployment app-a --image=nginx:1.27 --port=80
kubectl create deployment app-b --image=nginx:1.27 --port=80
kubectl expose deployment app-a --port=80
kubectl expose deployment app-b --port=80

kubectl exec deploy/app-a -- sh -c 'echo "APP A" > /usr/share/nginx/html/index.html'
kubectl exec deploy/app-b -- sh -c 'echo "APP B" > /usr/share/nginx/html/index.html'
```

### 5.3 Маршрутизация по пути

`~/k8s-lab/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo
spec:
  rules:
    - http:
        paths:
          - path: /a
            pathType: Prefix
            backend:
              service: { name: app-a, port: { number: 80 } }
          - path: /b
            pathType: Prefix
            backend:
              service: { name: app-b, port: { number: 80 } }
```

```bash
kubectl apply -f ingress.yaml
kubectl get ingress
curl http://localhost/a
curl http://localhost/b
```

Если получаешь 404 от nginx — он отдаёт `/a` как путь, а файла нет. Для демо проще маршрутизировать по хосту (ниже) или использовать middleware `StripPrefix` Traefik.

### 5.4 Маршрутизация по хосту

```yaml
spec:
  rules:
    - host: a.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: app-a, port: { number: 80 } }
    - host: b.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: app-b, port: { number: 80 } }
```

```bash
curl -H "Host: a.local" http://localhost
curl -H "Host: b.local" http://localhost
```

Заголовок `Host` заменяет настройку DNS. Для браузера добавь строки в `/etc/hosts` (`<IP> a.local b.local`).

### 5.5 TLS (самоподписанный сертификат)

```bash
openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "/CN=a.local"
kubectl create secret tls a-tls --cert=tls.crt --key=tls.key
```

В Ingress добавь:

```yaml
spec:
  tls:
    - hosts: [a.local]
      secretName: a-tls
```

```bash
curl -kv --resolve a.local:443:127.0.0.1 https://a.local
```

(В бою сертификаты выдаёт cert-manager + Let's Encrypt — тема для самостоятельного изучения.)

### 5.6 Дашборд Traefik (опционально)

```bash
kubectl -n kube-system port-forward deploy/traefik 9000:9000
# браузер: http://localhost:9000/dashboard/
```

## Задания

1. Добавь третье приложение `app-c` и маршрут `c.local`.
2. Сделай `/` отдавать `app-a`, а `/b` — `app-b`. Проверь, какой путь побеждает (самый длинный префикс).
3. Найди в `kubectl describe ingress demo`, какие backends резолвились в endpoints.

## Сломай и почини

Укажи в Ingress несуществующий Service. Что отвечает Traefik (503/404)? Какие события видны в `describe`? Исправь.

## Очистка

```bash
kubectl delete ingress demo
kubectl delete deploy app-a app-b
kubectl delete svc app-a app-b
kubectl delete secret a-tls
```

## Контрольные вопросы

- Чем Ingress отличается от Service?
- Что такое Ingress Controller и почему сам объект Ingress ничего не делает?
- Как Traefik узнаёт, куда слать трафик?
