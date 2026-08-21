Zomato Clone – Jenkins to EKS CI/CD Pipeline

A Node.js/Express mock food-delivery API, containerized with Docker, provisioned on AWS EKS via Terraform, and deployed automatically through a Jenkins CI/CD pipeline.

Project layout

- app/ - Express API (server.js, package.json)
- Dockerfile - multi-stage build, non-root runtime user
- Jenkinsfile - declarative pipeline: test, build, push, deploy
- k8s/ - namespace.yaml, deployment.yaml, service.yaml
- terraform/ - main.tf, variables.tf, vpc.tf, eks.tf, outputs.tf

API Endpoints

- GET / - API health message
- GET /health - Health check
- GET /restaurants - List restaurants
- GET /restaurants/:id/menu - Get menu
- POST /orders - Place an order
- GET /orders - List all orders

Infrastructure

VPC with public/private subnets across 2 AZs, EKS managed cluster v1.35 with managed node group, IAM access via EKS Access Entries.

Setup:
cd terraform
terraform init
terraform apply
aws eks update-kubeconfig --region ap-south-1 --name zomato-eks

CI/CD Pipeline

Jenkinsfile runs on every push to main: Checkout, Install and Test, Build Docker image, Push to Docker Hub, Deploy to EKS.

Jenkins credentials needed:
- dockerhub-creds (Username/password)
- kubeconfig-creds (Secret file)
- aws-eks-creds (AWS Credentials)

Local development

cd app
npm install
node server.js

Tech Stack

Node.js, Express, Docker, Terraform, AWS EKS, Kubernetes, Jenkins, Docker Hub
