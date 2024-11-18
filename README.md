# **Streamlining Code Collaboration: Smart Reviewer Suggestions & Approval Insights**

Welcome to the repository for our innovative Bitbucket Forge app designed to optimize pull request workflows! This project introduces intelligent reviewer suggestions, approval time predictions, and automated issue detection to streamline the code collaboration process.

---

## **Table of Contents**
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Demo](#demo)
6. [Technologies Used](#technologies-used)
7. [Future Enhancements](#future-enhancements)
8. [Contributors](#contributors)
    
---

## **Project Overview**

Code reviews are a critical part of the development lifecycle, yet they can often become bottlenecks. Our app solves this by leveraging data from Bitbucket repositories to:
- Suggest the most suitable reviewers based on historical activity.
- Predict approval times for pull requests using intelligent analysis.
- Detect potential issues in pull requests to minimize review delays.

This app is built on Atlassian's Forge platform, ensuring a secure and seamless integration with Bitbucket.

---

## **Features**

- **Reviewer Suggestions**: Intelligent suggestions based on past participation and expertise.
- **Approval Time Predictions**: Estimate how long it will take to approve a pull request.
- **Automated Issue Detection**: Identify common problems, such as missing tests or code style violations.
- **Interactive Visualizations**: Graphs and charts for actionable insights into pull request metrics.

---

## **Installation**

### Prerequisites
1. Atlassian Developer account.
2. Access to a Bitbucket workspace.
3. Node.js installed on your system.
4. Forge CLI installed. ([Get Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/))

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy the app using Forge CLI:
   ```bash
   forge deploy
   ```

4. Install the app to your Bitbucket workspace:
   ```bash
   forge install
   ```

---

## **Usage**

### Fetch Repository Data
- Displays repository details and pull request metrics.

### Reviewer Suggestions
- Provides a list of suggested reviewers for each pull request based on historical activity.

### Approval Time Predictions
- Predicts the estimated time for a pull request to be approved.

### Automated Issue Detection
- Detects common issues such as:
  - Missing tests
  - Trailing whitespace
  - Large pull requests
  - Hardcoded secrets


---

## **Demo**

Check out [demo video on YouTube]([(https://www.youtube.com/watch?v=hnD2BwtYwp8)]) for a detailed walkthrough of the app.

---

## **Technologies Used**

- **Frontend**: React, Forge UI Kit
- **Backend**: Node.js, Forge Resolver
- **APIs**: Bitbucket REST API
- **Platform**: Atlassian Forge

---

## **Future Enhancements**

1. **Advanced Machine Learning**:
   - Train a model to improve accuracy for reviewer suggestions and approval time predictions.

2. **Code Insights Integration**:
   - Provide inline comments for detected issues directly in the pull request view.

3. **Real-Time Analytics**:
   - Add live metrics for ongoing pull requests.

4. **Localization**:
   - Support multiple languages for global teams.

---

## **Contributors**

- [Suyash Salvi](https://github.com/SuyashSalvi) - Developer
