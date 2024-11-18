import React, { useEffect, useState } from "react";
import ForgeReconciler, { Text } from "@forge/react";
import { invoke } from "@forge/bridge";
// import { Bar, Pie } from "react-chartjs-2";

const App = () => {
  const [repoData, setRepoData] = useState(null);
  const [pullRequests, setPullRequests] = useState(null);
  const [pullRequestTitles, setPullRequestTitles] = useState(null);
  const [reviewers, setReviewers] = useState(null);
  const [approvalTimes, setApprovalTimes] = useState(null);
  const [reviewer_suggestions, setReviewer_suggestions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [approvalTime, setApprovalTime] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch repository details
        const repo = await invoke("fetchRepository");
        setRepoData(repo.full_name);
        console.log(`Repository full name: ${repo.full_name}`);

        // Fetch all pull requests
        const prs = await invoke("fetchPullRequests");
        setPullRequests(prs.values); // Assume `prs.values` contains an array of PR data
        // console.log("Pull Requests:", prs.values);

        // Fetch only pull request titles
        const titles = await invoke("fetchPullRequestTitles");
        setPullRequestTitles(titles);
        console.log("Pull Request Titles:", titles);

        // Pick the first pull request ID for demonstration purposes
        if (prs.values.length > 0) {
          const firstPullRequestId = prs.values[0].id;

          // Fetch reviewers for the first pull request
          const reviewers = await invoke("fetchReviewers", { pullRequestId: firstPullRequestId });
          setReviewers(reviewers);
          console.log("Reviewers:", reviewers);

          // Fetch approval times for the first pull request
          const times = await invoke("fetchApprovalTimes", { pullRequestId: firstPullRequestId });
          setApprovalTimes(times);
          console.log("Approval Times:", times);

          // Fetch reviewer suggestions
          const reviewer_suggestions = await invoke("suggestReviewers", { pullRequestId: firstPullRequestId });
          setReviewer_suggestions(reviewer_suggestions);
          console.log("Reviewer Suggestions:", reviewer_suggestions);

          // Detect issues
          const issues = await invoke("detectIssues", { pullRequestId: firstPullRequestId });
          setIssues(issues);
          console.log("Detected Issues:", issues);

          // Predict approval time
          const approvalTime = await invoke("predictApprovalTime", { pullRequestId: firstPullRequestId });
          setApprovalTime(approvalTime);
          console.log("Approval Time Prediction:", approvalTime);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  

  



  return (
    <>
      <Text> Pull Request Dashboard</Text>
    

      <Text>Repository: {repoData ? repoData : "Loading..."}</Text>
      <Text>Pull Requests: {pullRequestTitles ? pullRequestTitles : "Loading..."}</Text>

    
      
      <Text>Suggested Reviewers: {reviewer_suggestions != ''  ? reviewer_suggestions.join(", ") : "Can't predict, don't have enough data"}</Text>


      
      <Text>Detected Issues: {issues ? issues.join(", ") : "None"}</Text>
      <Text>Approval Time Prediction: {approvalTime != '0 hours' ? approvalTime : "Can't predict, don't have enough data"}</Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
