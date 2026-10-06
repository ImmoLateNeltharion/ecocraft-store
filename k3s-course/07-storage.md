# Урок 7. Хранилище

## Теория

Файловая система контейнера умирает вместе с ним. Для данных нужны **тома**.

- `emptyDir` — живёт, пока жив pod (кэш, обмен между контейнерами).
- **PersistentVolume (PV)** — кусок хранилища в кластере.
- **PersistentVolumeClaim (PVC)** — запрос pod'а: «дай 1 ГБ».
- **StorageClass** — «рецепт» динамического создания PV. В k3s по умолчанию `local-path`: каталог на диске ноды, `/var/lib/rancher/k3s/storage`.

Ограничение local-path: данные привязаны к конкретной ноде. Pod после пересоздания вернётся на ту же ноду (через nodeAffinity у PV).

## Практика

### 7.1 Что есть

```bash
kubectl get storageclass
kubectl get pv,pvc
```

### 7.2 PVC и pod

`pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: data }
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests: { storage: 1Gi }
```

`writer.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata: { name: writer }
spec:
  containers:
    - name: c
      image: busybox
      command: ["sh", "-c", "echo hello-$(date +%s) >> /data/file.txt; sleep 3600"]
      volumeMounts: [{ name: d, mountPath: /data }]
  volumes:
    - name: d
      persistentVolumeClaim: { claimName: data }
```

```bash
kubectl apply -f pvc.yaml
kubectl get pvc          # Pending — это нормально! (WaitForFirstConsumer)
kubectl apply -f writer.yaml
kubectl get pvc,pv       # теперь Bound
```

### 7.3 Проверка сохранности

```bash
kubectl exec writer -- cat /data/file.txt
kubectl delete pod writer
kubectl apply -f writer.yaml
kubectl exec writer -- cat /data/file.txt     # старая строка на месте + новая
```

Найди данные на диске ноды:

```bash
sudo ls /var/lib/rancher/k3s/storage/
```

### 7.4 StatefulSet — для приложений с состоянием

```yaml
apiVersion: v1
kind: Service
metadata: { name: db }
spec:
  clusterIP: None
  selector: { app: db }
  ports: [{ port: 5432 }]
---
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: db }
spec:
  serviceName: db
  replicas: 2
  selector: { matchLabels: { app: db } }
  template:
    metadata: { labels: { app: db } }
    spec:
      containers:
        - name: c
          image: busybox
          command: ["sh","-c","echo $(hostname) > /data/who; sleep 3600"]
          volumeMounts: [{ name: data, mountPath: /data }]
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        resources: { requests: { storage: 100Mi } }
```

```bash
kubectl apply -f sts.yaml
kubectl get pods,pvc -l app=db
```

Отличия от Deployment:
- Стабильные имена: `db-0`, `db-1`.
- У каждой реплики **свой** PVC (`data-db-0`, `data-db-1`).
- Запуск и остановка по порядку.
- Стабильный DNS: `db-0.db.default.svc.cluster.local`.

Удали `db-0` — вернётся с тем же именем и с теми же данными.

### 7.5 ReclaimPolicy

```bash
kubectl get pv -o custom-columns=NAME:.metadata.name,RECLAIM:.spec.persistentVolumeReclaimPolicy
```

У `local-path` по умолчанию `Delete`: удалил PVC — пропали данные. Попробуй и проверь содержимое каталога `/var/lib/rancher/k3s/storage/`.

Важно: PVC после удаления StatefulSet **не удаляются**.

## Задания

1. Расширь PVC (`storage: 2Gi`). Получится? (local-path не поддерживает resize — прочитай ошибку.)
2. Запиши в `emptyDir` файл, убей контейнер (`kubectl exec pod -- kill 1`) — данные живы; удали pod — данных нет.
3. Создай два pods, использующих один и тот же RWO-PVC на одной ноде. Работает? А на разных нодах (урок 9)?

## Сломай и почини

Запроси PVC с `storageClassName: nonexistent`. Он вечно Pending. Найди причину в `kubectl describe pvc`.

## Очистка

```bash
kubectl delete pod writer
kubectl delete sts db
kubectl delete pvc --all
kubectl delete svc db
```

## Контрольные вопросы

- В чём разница PV, PVC и StorageClass?
- Зачем StatefulSet, если есть Deployment + PVC?
- Что произойдёт с данными local-path при смерти ноды?
