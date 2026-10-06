# Курс: Kubernetes на k3s с нуля

Практический курс. Каждый урок: короткая теория → команды → задания → «сломай и почини».
Лучший способ учиться — не копировать, а набирать руками и ломать.

## Что нужно

- 1–3 Linux-машины/ВМ (Ubuntu 22.04/24.04 или Debian 12), по 2 CPU / 2 ГБ RAM минимум.
  Варианты: VPS, Multipass (`multipass launch --name k3s-1 -c 2 -m 2G`), Vagrant, VirtualBox, мини-ПК.
- Root/sudo, доступ в интернет.
- Для уроков 1–8 хватит **одной** ноды. Вторая нужна с урока 9.
- Не запускай на машине с важными данными: мы будем всё ломать.

## Программа

| # | Урок | Что освоишь |
|---|------|-------------|
| 1 | [Установка k3s и архитектура](01-install.md) | что внутри кластера, kubeconfig, kubectl |
| 2 | [Pod](02-pods.md) | базовая единица, логи, exec, жизненный цикл |
| 3 | [Deployment](03-deployments.md) | реплики, самолечение, rolling update, rollback |
| 4 | [Service и DNS](04-services.md) | ClusterIP, NodePort, discovery по имени |
| 5 | [Ingress (Traefik)](05-ingress.md) | HTTP-маршрутизация снаружи |
| 6 | [ConfigMap и Secret](06-config.md) | конфигурация отдельно от образа |
| 7 | [Хранилище](07-storage.md) | PV/PVC, StatefulSet, local-path |
| 8 | [Probes и ресурсы](08-probes-resources.md) | health checks, requests/limits, QoS |
| 9 | [Несколько нод](09-multinode.md) | join агента, scheduling, taints, drain |
| 10 | [Helm](10-helm.md) | пакеты, values, релизы |
| 11 | [Namespaces, RBAC, NetworkPolicy](11-security.md) | изоляция и права |
| 12 | [Диагностика](12-troubleshooting.md) | алгоритм поиска проблем, типовые ошибки |
| 13 | [Финальный проект](13-final-project.md) | собрать всё вместе + очистка |

Рекомендуемый темп: 1 урок = 30–60 минут.

## Правила работы

1. Каждый урок делай в своём namespace или чисти за собой (`kubectl delete -f ...`).
2. Манифесты храни в `~/k8s-lab/` — YAML-файл важнее команды `kubectl run`.
3. Перед тем как читать «ответ» в заданиях — попробуй сам, потом `kubectl explain` и `kubectl describe`.
4. Главный инструмент отладки: `kubectl describe` и `kubectl get events`.

Полезные алиасы (добавь в `~/.bashrc`):

```bash
alias k=kubectl
source <(kubectl completion bash)
complete -o default -F __start_kubectl k
```
