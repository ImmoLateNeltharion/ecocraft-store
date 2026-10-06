# Урок 13. Финальный проект

Цель: развернуть «настоящее» приложение, применив всё из курса. Делай по шагам, без подсказок, подглядывая в предыдущие уроки.

## Задача

Приложение «счётчик посещений»: веб (nginx/любой образ) → API → Redis.

Можно использовать готовый образ, например `ghcr.io/stefanprodan/podinfo` (поддерживает Redis-кэш, probes, метрики) и `redis:7`.

## Требования

1. **Namespace** `shop`, ResourceQuota (pods ≤ 20).
2. **Redis**: StatefulSet с PVC 500Mi, headless Service, пароль из **Secret**.
3. **API (podinfo)**: Deployment, 3 реплики, `readinessProbe` + `livenessProbe`, `requests/limits`, конфиг из **ConfigMap**, пароль Redis из Secret.
4. **Service** ClusterIP для API.
5. **Ingress** на `shop.local` (с TLS-секретом самоподписанного сертификата).
6. **Rolling update** с `maxUnavailable: 0`; докажи отсутствие простоя (`while true; do curl ...; done` во время обновления).
7. **NetworkPolicy**: к Redis ходит только API; к API — только Traefik.
8. **RBAC**: ServiceAccount для API без прав, `automountServiceAccountToken: false`.
9. **PodAntiAffinity/topologySpread**: реплики API на разных нодах (если нод 2+).
10. Всё оформлено **YAML-файлами в git** (по желанию — собери Helm chart или Kustomize).

## Проверка (приёмка)

```bash
kubectl -n shop get all,pvc,ingress,networkpolicy
curl -k --resolve shop.local:443:<IP> https://shop.local/
kubectl -n shop delete pod -l app=api          # приложение не падает
kubectl -n shop delete pod redis-0             # данные не потеряны
kubectl -n shop drain <нода> --ignore-daemonsets --delete-emptydir-data  # живо
```

Тест изоляции:

```bash
kubectl run intruder -n default --rm -it --image=curlimages/curl -- curl -m 3 redis.shop   # timeout
```

## Расширения (по желанию)

- cert-manager + Let's Encrypt (если есть домен и публичный IP).
- Prometheus + Grafana через Helm (`kube-prometheus-stack`).
- GitOps: Flux или Argo CD, автоприменение из git.
- HA control plane: 3 server-ноды `--cluster-init` с встроенным etcd.
- Бэкап: `k3s etcd-snapshot save` (при etcd) или копирование SQLite-БД `/var/lib/rancher/k3s/server/db/`.
- Обновление k3s: `curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=vX.Y.Z+k3s1 sh -` (по очереди, сервер → агенты).

## Что изучать дальше

1. **Kustomize** (встроен в kubectl: `kubectl apply -k`).
2. **Jobs/CronJobs**, **PodDisruptionBudget**, **PriorityClass**.
3. **Operators и CRD**.
4. **Service mesh** (Linkerd/Istio) — только когда понадобится.
5. Экзамен CKA/CKAD — практика из этого курса покрывает значительную часть.

## Очистка

```bash
kubectl delete ns shop
# полное удаление k3s
/usr/local/bin/k3s-uninstall.sh          # на сервере
/usr/local/bin/k3s-agent-uninstall.sh    # на агентах
```

## Итоговые вопросы

1. Опиши путь HTTPS-запроса от браузера до процесса в контейнере.
2. Что произойдёт, если упадёт: pod / нода с pod / etcd / CoreDNS / Traefik?
3. Как бы ты выкатил обновление без простоя и откатил при проблеме?
4. Как защитить кластер от компрометации одного pod?
