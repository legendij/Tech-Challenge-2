pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    AWS_REGION = "us-east-1"
    ECR_URI    = "391061376449.dkr.ecr.us-east-1.amazonaws.com/tc2-app"
    CHART_PATH = "helm/tc2-chart"
    NAMESPACE  = "tc2"
    RELEASE    = "tc2"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker image') {
      steps {
        sh 'docker build -t tc2-app:build ./app'
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''
          aws --version
          aws ecr get-login-password --region $AWS_REGION \
            | docker login --username AWS --password-stdin 391061376449.dkr.ecr.$AWS_REGION.amazonaws.com
        '''
      }
    }

    stage('Tag + Push to ECR') {
      steps {
        sh '''
          #!/usr/bin/env bash
          set -e
          
          TAG=$(echo "$GIT_COMMIT" | cut -c1-7)
          echo "Pushing tag: $TAG"

          docker tag tc2-app:build $ECR_URI:$TAG
          docker push $ECR_URI:$TAG

          echo $TAG > image_tag..txt
        '''
      }
    }

    stage('Deploy to EKS via Helm') {
      steps {
        sh '''
          TAG=$(cat image_tag.txt)
          kubectl get ns $NAMESPACE >/dev/null 2>&1 || kubectl create ns $NAMESPACE

          helm upgrade --install $RELEASE $CHART_PATH -n $NAMESPACE \
            --set image.repository=$ECR_URI \
            --set image.tag=$TAG

          kubectl -n $NAMESPACE rollout status deploy/tc2-app --timeout=180s
          kubectl -n $NAMESPACE get pods -o wide
        '''
      }
    }
  }
}
