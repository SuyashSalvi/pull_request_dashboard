import Resolver from '@forge/resolver';
import api, { route } from "@forge/api";


const resolver = new Resolver();

// resolver.define('getText', (req) => {
//   console.log(req);
//   return 'Hello, world!';
// });

resolver.define("fetchRepository", async ({ context }) => {
  const workspaceId = context.workspaceId;
  const repositoryId = context.extension.repository.uuid;

  console.log(`Fetching repository ${workspaceId}/${repositoryId}`)

  const res = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}`
    );

  return res.json();
});

resolver.define("fetchPullRequests", async ({ context }) => {
  const workspaceId = context.workspaceId;
  const repositoryId = context.extension.repository.uuid;

  console.log(`Fetching pull requests for repository ${workspaceId}/${repositoryId}`);

  const res = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests`
    );

    resolver.define("fetchReviewers", async ({ context, payload }) => {
      const { pullRequestId } = payload; // Pass pull request ID from frontend
      const workspaceId = context.workspaceId;
      const repositoryId = context.extension.repository.uuid;
    
      console.log(`Fetching reviewers for PR ${pullRequestId} in repository ${workspaceId}/${repositoryId}`);
    
      const res = await api
        .asApp()
        .requestBitbucket(
          route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}/participants`
        );
    
      return res.json();
    });

    resolver.define("fetchApprovalTimes", async ({ context, payload }) => {
      const { pullRequestId } = payload;
      const workspaceId = context.workspaceId;
      const repositoryId = context.extension.repository.uuid;
    
      console.log(`Fetching approval times for PR ${pullRequestId} in repository ${workspaceId}/${repositoryId}`);
    
      const res = await api
        .asApp()
        .requestBitbucket(
          route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}/activity`
        );
    
      return res.json();
    });
    
    

  return res.json();
});


resolver.define("fetchPullRequestTitles", async ({ context }) => {
  const workspaceId = context.workspaceId;
  const repositoryId = context.extension.repository.uuid;

  console.log(`Fetching pull request titles for repository ${workspaceId}/${repositoryId}`);

  const res = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests`
    );

  const data = await res.json();

  // Extract only titles and IDs from the pull requests
  // const pullRequestTitles = data.values.map((pr) => ({
  //   id: pr.id,
  //   title: pr.title,
  // }));

  const pullRequestTitles = data.values.map((pr) => pr.title);


  return pullRequestTitles;
});


resolver.define("suggestReviewers", async ({ context, payload }) => {
  const { pullRequestId } = payload;
  const workspaceId = context.workspaceId;
  const repositoryId = context.extension.repository.uuid;

  // Fetch reviewers for the pull request
  const reviewersRes = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}/participants`
    );

  const reviewers = await reviewersRes.json();

  // Fetch historical pull requests
  const pullRequestsRes = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests`
    );

  const pullRequests = await pullRequestsRes.json();

  // Analyze historical data
  const reviewerSuggestions = pullRequests.values
    .flatMap((pr) => pr.participants || [])
    .reduce((acc, participant) => {
      if (participant?.user?.display_name) {
      acc[participant.user.display_name] =
        (acc[participant.user.display_name] || 0) + 1;
      }
      return acc;
    }, {});

  // Sort reviewers by frequency
  const sortedSuggestions = Object.entries(reviewerSuggestions)
    .sort((a, b) => b[1] - a[1])
    .map(([reviewer]) => reviewer);

  return sortedSuggestions;
});


resolver.define("detectIssues", async ({ context, payload }) => {
  const { pullRequestId } = payload;
  const workspaceId = context.workspaceId;
  const repositoryId = context.extension.repository.uuid;

  // Fetch pull request details
  const pullRequestRes = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}`
    );
  const pullRequest = await pullRequestRes.json();

  // Fetch diff details for the pull request
  const diffRes = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}/diff`
    );
  const diff = await diffRes.text(); // Assuming the diff is plain text

  // Issues list to populate
  const issues = [];

  // 1. Branch Name Conventions
  if (!/^(feature|bugfix|hotfix)\/[a-zA-Z0-9_-]+$/.test(pullRequest.source.branch.name)) {
    issues.push("Branch name does not follow naming conventions (e.g., feature/xyz).");
  }

  // 2. Large Pull Requests
  const filesChanged = diff.split("\n").filter((line) => line.startsWith("+++")).length;
  if (filesChanged > 10) {
    issues.push("Pull request contains changes to more than 10 files. Consider splitting it.");
  }

  // 3. Missing Tests
  if (!diff.includes("test") && !pullRequest.title.toLowerCase().includes("test")) {
    issues.push("No tests detected in the pull request.");
  }

  // 4. Code Style Violations
  const diffLines = diff.split("\n");
  diffLines.forEach((line, index) => {
    if (/\s+$/.test(line)) {
      issues.push(`Trailing whitespace detected on line ${index + 1}.`);
    }
    if (line.includes("TODO")) {
      issues.push(`Unresolved TODO comment on line ${index + 1}.`);
    }
  });

  // 5. Long Functions or Methods
  let functionLineCount = 0;
  diffLines.forEach((line) => {
    if (line.trim().startsWith("function") || line.trim().includes("=>")) {
      functionLineCount = 1; // Start counting lines in the function
    } else if (functionLineCount > 0) {
      if (line.trim() === "}" || line.startsWith("-")) {
        // End of the function
        if (functionLineCount > 50) {
          issues.push(`Function exceeds 50 lines. Consider refactoring.`);
        }
        functionLineCount = 0; // Reset the count
      } else {
        functionLineCount++;
      }
    }
  });

  // 6. Detect Hardcoded Secrets
  const sensitiveKeywords = ["password", "secret", "apikey", "token"];
  diffLines.forEach((line, index) => {
    sensitiveKeywords.forEach((keyword) => {
      if (line.toLowerCase().includes(keyword)) {
        issues.push(`Potential hardcoded secret detected on line ${index + 1}: "${keyword}"`);
      }
    });
  });

  // 7. Ensure PR Title Follows Format
  if (!/^(feat|fix|refactor|docs|test|chore):\s.+/.test(pullRequest.title)) {
    issues.push('PR title does not follow conventional format (e.g., "feat: Add login feature").');
  }

  // 8. Unnecessary File Changes
  const unnecessaryFiles = ["package-lock.json", "yarn.lock"];
  diffLines.forEach((line) => {
    unnecessaryFiles.forEach((file) => {
      if (line.includes(file)) {
        issues.push(`Unnecessary changes to "${file}". Revert if not required.`);
      }
    });
  });

  // 9. Ensure Proper Documentation
  if (!diff.includes("README") && filesChanged > 5) {
    issues.push("Consider updating the documentation to reflect the changes in this PR.");
  }

  // 10. Detect Large Files Added
  // const addedFiles = diff
  //   .split("\n")
  //   .filter((line) => line.startsWith("+++"))
  //   .map((line) => line.split("+++ b/")[1] || "");
  // addedFiles.forEach((file) => {
  //   if (file.endsWith(".js") || file.endsWith(".ts")) {
  //     const fileSizeRes = await api
  //       .asApp()
  //       .requestBitbucket(route`/2.0/repositories/${workspaceId}/${repositoryId}/src/${file}`);
  //     const fileSize = parseInt(fileSizeRes.headers.get("content-length"), 10);
  //     if (fileSize > 500 * 1024) {
  //       issues.push(`File "${file}" exceeds 500KB. Consider breaking it into smaller files.`);
  //     }
  //   }
  // });

  return issues;
});



resolver.define("predictApprovalTime", async ({ context, payload }) => {
  const { pullRequestId } = payload;
  const workspaceId = context.workspaceId;
  const repositoryId = context.extension.repository.uuid;

  // Fetch historical activity for the pull request
  const approvalTimesRes = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}/activity`
    );

  const activities = await approvalTimesRes.json();

  // Fetch pull request details to include size and reviewers
  const pullRequestRes = await api
    .asApp()
    .requestBitbucket(
      route`/2.0/repositories/${workspaceId}/${repositoryId}/pullrequests/${pullRequestId}`
    );
  const pullRequest = await pullRequestRes.json();

  // 1. Calculate Historical Approval Times
  const approvalTimes = activities.values
    .filter((activity) => activity.action === "approved")
    .map((activity) => {
      const createdOn = new Date(activity.created_on).getTime();
      const approvedOn = new Date(activity.updated_on).getTime();
      return approvedOn - createdOn;
    });

  const averageApprovalTime =
    approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length || 0;

  // 2. Factor in Number of Reviewers
  const numReviewers = pullRequest.participants.filter(
    (participant) => participant.role === "REVIEWER"
  ).length;

  const reviewerFactor = numReviewers > 3 ? 1.2 : 1.0; // Add 20% if > 3 reviewers

  // 3. Factor in Pull Request Size (Number of Changed Files)
  const filesChanged = pullRequest.source.branch.changes || 0;
  const sizeFactor = filesChanged > 10 ? 1.5 : filesChanged > 5 ? 1.2 : 1.0;

  // 4. Adjust for Historical Workload (mocked here, replace with actual logic)
  const workloadFactor = 1.1; // Assume reviewers are moderately busy

  // Final Prediction: Adjust average approval time
  const adjustedApprovalTime =
    averageApprovalTime * reviewerFactor * sizeFactor * workloadFactor;

  // Convert to hours
  const predictedApprovalTime = Math.round(adjustedApprovalTime / (60 * 60 * 1000)); // ms to hours

  return `${predictedApprovalTime} hours`;
});







export const handler = resolver.getDefinitions();
