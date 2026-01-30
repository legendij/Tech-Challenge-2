pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    AWS_REGION     = "us-east-1"
    AWS_ACCOUNT_ID = "391061376449"
    ECR_REPO       = "tc2-app"
    ECR_URI        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

    // IMPORTANT: local chart directory in the repo (must be committed to GitHub)
    CHART_PATH     = "./helm/tc2-chart"

    NAMESPACE      = "tc2"
    RELEASE        = "tc2"

    // Use the mounted kubeconfig inside the Jenkins container
    KUBECONFIG     = "/var/jenkins_home/.kube/config"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh '''
          #!/usr/bin/env bash
          set -euo pipefail
          echo "Workspace: $PWD"
          echo "Repo contents:"
          ls -la
        '''
      }
    }

    stage('Preflight: Validate Helm chart exists') {
      steps {
        sh '''
          #!/usr/bin/env bash
          set -euo pipefail

          echo "Checking chart path: ${CHART_PATH}"
          ls -la ./helm || true
          ls -la "${CHART_PATH}" || true

          if [[ ! -f "${CHART_PATH}/Chart.yaml" ]]; then
            echo "ERROR: Helm chart not found at ${CHART_PATH}."
            echo "Make sure ./helm/tc2-chart is committed & pushed to GitHub."
            exit 1
          fi

          echo "Chart.yaml found ✅"
        '''
      }
    }

    stage('Build Docker image') {
      steps {
        sh '''
          #!/usr/bin/env bash
          set -euo pipefail
          docker version
          docker build -t tc2-app:build ./app
        '''
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''
          #!/usr/bin/env bash
          set -euo pipefail
          aws --version
          aws ecr get-login-password --region "$AWS_REGION" \
            | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        '''
      }
    }

    stage('Tag + Push to ECR') {
      steps {
        sh '''
          #!/usr/bin/env bash
          set -euo pipefail

          TAG="$(echo "$GIT_COMMIT" | cut -c1-7)"
          echo "Pushing image tag: $TAG"

          docker tag tc2-app:build "$ECR_URI:$TAG"
          docker push "$ECR_URI:$TAG"
        '''
      }
    }

    stage('Deploy to EKS via Helm') {
      steps {
        sh '''
          #!/usr/bin/env bash
          set -euo pipefail

          TAG="$(echo "$GIT_COMMIT" | cut -c1-7)"
          echo "Deploying image tag: $TAG"

          kubectl version --client
          helm version

          kubectl get ns "$NAMESPACE" >/dev/null 2>&1 || kubectl create ns "$NAMESPACE"

          helm upgrade --install "$RELEASE" "$CHART_PATH" -n "$NAMESPACE" \
            --set image.repository="$ECR_URI" \
            --set image.tag="$TAG"

          echo "Deployments:"
          kubectl -n "$NAMESPACE" get deploy -o wide

          echo "Waiting for rollout (label-based):"
          kubectl -n "$NAMESPACE" rollout status deploy -l app.kubernetes.io/instance="$RELEASE" --timeout=180s

          echo "Pods:"
          kubectl -n "$NAMESPACE" get pods -o wide

          echo "Services:"
          kubectl -n "$NAMESPACE" get svc -o wide

          echo "Ingress (if enabled):"
          kubectl -n "$NAMESPACE" get ingress -o wide || true
        '''
      }
    }
  }

  post {
    always {
      sh '''
        #!/usr/bin/env bash
        set +e
        echo "Build finished. Context:"
        echo "BRANCH=${BRANCH_NAME:-}"
        echo "COMMIT=${GIT_COMMIT:-}"
      '''
    }
  }
}