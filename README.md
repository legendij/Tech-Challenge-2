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

## ✅ PART 2 — Clean Step-by-Step Guide (No Troubleshooting)

This will be a **separate document** (or separate chat later if you want), structured like:

### Tech Challenge 2 — Clean Execution Guide

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


