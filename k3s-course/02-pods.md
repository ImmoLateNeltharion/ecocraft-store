# Урок 2. Pod

## Теория

**Pod** — минимальная единица запуска: один или несколько контейнеров, которые делят сеть (один IP, localhost) и тома. Обычно — один контейнер на pod.

Важно: pod **эфемерен**. Умер — не воскреснет сам (воскрешать будут контроллеры, урок 3). IP у нового pod будет другой.

Фазы: `Pending` → `Running` → `Succeeded`/`Failed`. Для контейнера: `Waiting` / `Running` / `Terminated`.

## Практика

### 2.1 Императивно (быстро, для экспериментов)

```bash
kubectl run web --image=nginx:1.27
kubectl get pods -w          # Ctrl+C для выхода
kubectl get pod web -o wide
```

### 2.2 Декларативно (так делают всегда)

`~/k8s-lab/pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello
  labels:
    app: hello
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      ports:
        - containerPort: 80
```

```bash
kubectl apply -f pod.yaml
kubectl describe pod hello       # смотри раздел Events внизу!
kubectl logs hello
kubectl exec -it hello -- sh
# внутри:  curl -s localhost  ||  cat /etc/nginx/nginx.conf ; exit
```

Обращение к pod с твоей машины без Service:

```bash
kubectl port-forward pod/hello 8080:80
# в другом терминале: curl localhost:8080
```

### 2.3 Посмотреть YAML живого объекта

```bash
kubectl get pod hello -o yaml
```

Найди `status`, `nodeName`, `podIP`, `uid`, `resourceVersion`. Всё, что не писал сам — добавил кластер.

Шаблон манифеста без создания: `kubectl run x --image=nginx --dry-run=client -o yaml`.

### 2.4 Два контейнера в одном pod (sidecar)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-demo
spec:
  containers:
    - name: app
      image: busybox
      command: ["sh", "-c", "while true; do date >> /data/log.txt; sleep 2; done"]
      volumeMounts:
        - { name: shared, mountPath: /data }
    - name: reader
      image: busybox
      command: ["sh", "-c", "tail -F /data/log.txt"]
      volumeMounts:
        - { name: shared, mountPath: /data }
  volumes:
    - name: shared
      emptyDir: {}
```

```bash
kubectl apply -f sidecar.yaml
kubectl logs sidecar-demo -c reader
```

### 2.5 Init-контейнер

Добавь в `spec`:

```yaml
  initContainers:
    - name: wait
      image: busybox
      command: ["sh", "-c", "echo preparing; sleep 5"]
```

Наблюдай `kubectl get pod -w`: статус `Init:0/1` → `PodInitializing` → `Running`.

## Задания

1. Запусти pod с несуществующим образом `nginx:no-such-tag`. Посмотри статус (`ErrImagePull` → `ImagePullBackOff`) и причину в `describe`.
2. Запусти `busybox` с командой `sh -c "exit 1"` и `restartPolicy: Always`. Посмотри `CrashLoopBackOff` и счётчик `RESTARTS`.
3. Удали pod `hello`. Вернулся ли он? (нет — запомни это перед уроком 3.)
4. Определи, сколько секунд pod удаляется (`terminationGracePeriodSeconds`, по умолчанию 30) и почему `sleep infinity` как PID 1 убивается именно 30 секунд (он игнорирует SIGTERM).

## Сломай и почини

Запусти pod с опечаткой в YAML (`contaners:` вместо `containers:`). Прочитай ошибку валидации. Запусти `kubectl apply --dry-run=server -f pod.yaml` — полезная привычка.

## Очистка

```bash
kubectl delete pod --all
```

## Контрольные вопросы

- Что общее у контейнеров в одном pod?
- Почему не стоит создавать «голые» pods в проде?
- Чем `kubectl logs` отличается от `kubectl exec`?
