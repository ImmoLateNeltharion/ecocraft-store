# Урок 6. ConfigMap и Secret

## Теория

Образ должен быть один для всех окружений, а конфигурация — отдельно.

- **ConfigMap** — несекретные данные (ключ-значение или файлы).
- **Secret** — то же для чувствительных данных. Значения в base64 — это **кодировка, не шифрование**. Защита обеспечивается RBAC и (опционально) шифрованием etcd.

Подключаются как: переменные окружения, файлы в томе, аргументы команды.

## Практика

### 6.1 Создание

```bash
kubectl create configmap app-config \
  --from-literal=APP_MODE=dev \
  --from-literal=GREETING="Привет"

kubectl get cm app-config -o yaml
```

Из файла:

```bash
cat > nginx.conf <<'EOF'
server {
  listen 80;
  location / { return 200 "config from ConfigMap\n"; }
}
EOF
kubectl create configmap nginx-conf --from-file=default.conf=nginx.conf
```

Secret:

```bash
kubectl create secret generic db-cred \
  --from-literal=user=admin --from-literal=password='s3cr3t'
kubectl get secret db-cred -o yaml
echo 'czNjcjN0' | base64 -d      # раскодируется без всякого ключа!
```

### 6.2 Как env-переменные

```yaml
apiVersion: v1
kind: Pod
metadata: { name: env-demo }
spec:
  containers:
    - name: c
      image: busybox
      command: ["sh", "-c", "env | grep -E 'APP_|DB_'; sleep 3600"]
      envFrom:
        - configMapRef: { name: app-config }
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef: { name: db-cred, key: password }
```

```bash
kubectl apply -f env-demo.yaml
kubectl logs env-demo
```

### 6.3 Как файлы (том)

```yaml
apiVersion: v1
kind: Pod
metadata: { name: nginx-cfg, labels: { app: nginx-cfg } }
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      volumeMounts:
        - name: conf
          mountPath: /etc/nginx/conf.d
  volumes:
    - name: conf
      configMap: { name: nginx-conf }
```

```bash
kubectl apply -f nginx-cfg.yaml
kubectl exec nginx-cfg -- ls /etc/nginx/conf.d
kubectl exec nginx-cfg -- curl -s localhost
```

### 6.4 Обновление конфигурации

```bash
kubectl edit cm nginx-conf     # измени текст ответа
sleep 60                        # kubelet синхронизирует файлы раз в ~минуту
kubectl exec nginx-cfg -- cat /etc/nginx/conf.d/default.conf
```

Выводы:
- Файлы из тома **обновляются сами**; приложение должно перечитать конфиг.
- Переменные окружения **не обновляются** — нужен перезапуск: `kubectl rollout restart deploy/...`.
- Тома с `subPath` не обновляются никогда.

### 6.5 Иммутабельность

Добавь `immutable: true` в ConfigMap — его нельзя изменить, только пересоздать. Хорошая практика + разгрузка API-сервера.

## Задания

1. Подай Secret в pod как файл (`secret.secretName`) и проверь права (`defaultMode: 0400`).
2. Создай ConfigMap декларативно в YAML (а не через `create`).
3. Реализуй паттерн «хэш конфига в аннотации pod» — вручную измени аннотацию `checksum/config`, чтобы вызвать перекат Deployment.

## Сломай и почини

Сошлись на несуществующий ConfigMap в pod. Статус `CreateContainerConfigError`. Найди причину в `describe`. Создай ConfigMap — pod запустится сам (без пересоздания).

## Очистка

```bash
kubectl delete pod env-demo nginx-cfg
kubectl delete cm app-config nginx-conf
kubectl delete secret db-cred
```

## Контрольные вопросы

- Почему Secret не защищает данные «по умолчанию»?
- Какие способы подачи конфигурации обновляются на лету, а какие — нет?
- Что такое `immutable` и зачем он?
