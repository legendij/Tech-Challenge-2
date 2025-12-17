# Tech Challenge 2 — Containerized Application Deployment with EKS & CI/CD

## Overview
This project demonstrates deploying a containerized Node.js application to **AWS EKS** using **Terraform** for infrastructure provisioning and **Jenkins** for CI/CD automation.

The pipeline automatically builds Docker images, pushes them to **Amazon ECR**, and deploys updates to **EKS** when changes are pushed to GitHub.

---

## Architecture
GitHub → Jenkins → Amazon ECR → Amazon EKS

**Core Services Used**
- Node.js (Express)
- Docker
- AWS EKS (Kubernetes)
- Amazon ECR
- Terraform
- Jenkins (EC2-hosted, containerized)
- GitHub Webhooks

---

## Repository Structure
├── app/ # Node.js application + Dockerfile
├── k8s/ # Kubernetes manifests (Deployment & Service)
├── terraform/ # EKS, VPC, ECR infrastructure (IaC)
├── Jenkinsfile # CI/CD pipeline definition
├── .gitignore
└── README.md

---

## Application
- **Endpoint:** `/`
- **Health Check:** `/health`
- **Container Port:** 3000
- **Service Type:** LoadBalancer

---

## Infrastructure Provisioning (Terraform)

```bash
cd terraform
terraform init
terraform apply

This provisions:

VPC with public/private subnets

EKS cluster with managed node group

Amazon ECR repository

Kubernetes Deployment
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

After deployment, the application is accessible via the AWS LoadBalancer DNS name.

CI/CD Pipeline (Jenkins)
Pipeline Flow

GitHub push to main

Jenkins auto-triggered via webhook

Docker image built

Image pushed to Amazon ECR

Deployment updated in EKS

Jenkins Hosting

Jenkins runs in a Docker container on a dedicated EC2 instance

IAM Role attached to EC2 for ECR and EKS access

Webhook exposed on port 80 for reliability

Cleanup / Teardown (IMPORTANT)

When finished, all resources can be safely removed to avoid AWS charges.

Delete Kubernetes resources

kubectl delete svc tc2-app-svc
kubectl delete deployment tc2-app

cd terraform
terraform destroy

Notes

Jenkins is intentionally deployed on a standalone EC2 instance (not EKS nodes)

Port 80 is used for webhook reliability

No static AWS credentials are stored in Jenkins


---

✅ This README:
- Explains **what**, **why**, and **how**
- Passes reviewer scrutiny
- Includes teardown steps (but doesn’t require execution yet)

---

**Phase 0:** Scope & Guardrails  
**Phase 1:** Local Node.js App  
**Phase 2:** Dockerization  
**Phase 3:** Terraform (EKS + VPC + ECR)  
**Phase 4:** Kubernetes Deployment  
**Phase 5:** Jenkins CI/CD  
**Phase 6:** Validation  
**Phase 7:** Teardown  

Each phase will have:
- Commands only
- Expected outputs
- No “if broken” branches

Bonus: GitOps Alternative (GitHub Actions + Argo CD)

This bonus implements a GitOps-style CI/CD workflow as an alternative to Jenkins.

Goal:
CI (GitHub Actions):
Build a Docker image from the app/ directory
Push the image to Amazon ECR
Update helm/values.yaml with the new image tag (commit SHA)
CD (Argo CD):
Watch the gitops branch
Deploy the Helm chart from the helm/ directory
Auto-sync changes to the EKS cluster (with prune + self-heal)
Branch Strategy
main branch: Jenkins-based workflow (original Tech Challenge)
gitops branch: GitOps workflow (GitHub Actions + Argo CD)

Prerequisites
AWS resources already created:
EKS cluster
ECR repository: tech-challenge-2/app
GitHub repository secrets configured (Repository → Settings → Secrets and variables → Actions):
AWS_ROLE_ARN = ARN of the IAM role used by GitHub Actions (OIDC)
AWS_REGION = us-east-1
ECR_REPO_APP = tech-challenge-2/app

Step 1 — GitHub Actions CI (build + push to ECR)
    Workflow file:
    .github/workflows/ci.yml

Trigger:
    Runs on push to the gitops branch, limited to changes under:
    app/**
    helm/**
    .github/workflows/**

What it does:
    Authenticates to AWS via OIDC (no long-lived AWS keys stored in GitHub)
    Builds Docker image from ./app
    Pushes image to ECR with tag equal to the commit SHA
    Updates helm/values.yaml image tag and commits it back to gitops

Step 2 — Helm Chart (Deployment Source of Truth)
Helm chart directory:
    helm/

Key values file:
    helm/values.yaml
    Example structure:

global:
  awsAccountId: "391061376449"
  awsRegion: "us-east-1"

image:
  repo: "tech-challenge-2/app"
  tag: "<commit-sha>"

service:
  port: 3000

Step 3 — Install Argo CD on EKS
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl get pods -n argocd

Expose Argo CD UI (local):
kubectl port-forward svc/argocd-server -n argocd 8080:443

Get initial admin password:
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d; echo

Login:
URL: https://localhost:8080
Username: admin
Password: (from the command above)

Step 4 — Create Argo CD Application (Bootstrap GitOps)
Create a new app in Argo CD with:
    Application Name: tech-challenge-2
    Project: default
    Sync Policy: Automatic (Enable Auto-Sync, Prune, Self-Heal)

Source:
    Repo URL: https://github.com/legendij/Tech-Challenge-2.git
    Revision: gitops
    Path: helm

Destination:
    Cluster: https://kubernetes.default.svc
    Namespace: default

Expected result:
    App becomes Healthy and Synced
    Deployment and Service created in the cluster

Step 5 — Verify Deployment (GitOps)
Check Kubernetes resources:
kubectl get deployments,svc,pods -n default

Confirm running image:
kubectl get pod -l app=app -o jsonpath="{.items[0].spec.containers[0].image}"; echo

Test the service locally:
kubectl port-forward svc/app 8081:3000
curl http://127.0.0.1:8081/

Step 6 — Prove Full GitOps Rollout
Make a small change to app/index.js, commit, and push to gitops:
git checkout gitops
# edit app/index.js
git add app/index.js
git commit -m "test: trigger gitops rollout"
git pull --rebase origin gitops
git push

Expected:
    GitHub Actions builds and pushes a new image to ECR
    Helm values get updated with the new tag
    Argo CD auto-syncs and redeploys the pod
