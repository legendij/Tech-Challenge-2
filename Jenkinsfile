pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
    ECR_REPO = "391061376449.dkr.ecr.us-east-1.amazonaws.com/tech-challenge-2/app"
    IMAGE_TAG = "latest"
    CLUSTER_NAME = "tc2-eks-cluster"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t tc2-node-app ./app'
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION \
          | docker login --username AWS --password-stdin $ECR_REPO
        '''
      }
    }

    stage('Push Image') {
      steps {
        sh '''
          docker tag tc2-node-app:latest $ECR_REPO:$IMAGE_TAG
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy to EKS') {
      steps {
        sh '''
          aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
          kubectl apply -f k8s/deployment.yaml
        '''
      }
    }
  }
}
