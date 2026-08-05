const normalizeSeverity = (severity) => {
    const value = (severity || '').toLowerCase();

    switch (value) {
        case 'critical':
            return 'CRITICAL';
        case 'error':
        case 'high':
            return 'ERROR';
        case 'warning':
        case 'medium':
            return 'WARNING';
        case 'suggestion':
            return 'SUGGESTION';
        case 'info':
        case 'low':
            return 'INFO';
        default:
            return 'INFO';
    }
};

const buildIssue = ({ title, description, suggestion, severity, file, line, originalCode, suggestedCode }) => ({
    id: `${file || 'file'}-${line || 0}-${Math.random().toString(36).slice(2, 8)}`,
    severity: normalizeSeverity(severity),
    title,
    file: file || 'workspace',
    line: line || 1,
    description: description || 'Review suggestion',
    whyItMatters: description || 'This issue should be addressed to improve code quality.',
    suggestedFix: suggestion || 'Review and update the implementation.',
    originalCode,
    suggestedCode,
});

export const buildReviewIssues = (review) => {
    const issues = [];

    const addIssuesFromList = (list, kind) => {
        list.forEach((item) => {
            issues.push(
                buildIssue({
                    title: item.title || `${kind} issue`,
                    description: item.message || item.description || 'Potential issue found during review.',
                    suggestion: item.suggestion || 'Consider refactoring this section for safety and clarity.',
                    severity: item.severity || 'warning',
                    file: item.file || 'workspace',
                    line: item.line || 1,
                    originalCode: item.originalCode,
                    suggestedCode: item.suggestedCode,
                })
            );
        });
    };

    addIssuesFromList(review.securityIssues || [], 'Security');
    addIssuesFromList(review.performanceIssues || [], 'Performance');
    addIssuesFromList(review.bugs || [], 'Bug');

    if (issues.length === 0) {
        const fallbackIssue = buildIssue({
            title: 'No issues detected',
            description: review.summary || 'The submitted code looks healthy based on the latest review.',
            suggestion: 'Keep monitoring the codebase as it evolves.',
            severity: 'INFO',
            file: 'workspace',
            line: 1,
        });
        issues.push(fallbackIssue);
    }

    return issues;
};

export const buildReviewResponse = (review, project = null) => {
    const score = Number(review.score || 0);
    const categories = review.categories || {};

    return {
        id: review._id?.toString() || review.id,
        projectId: project?._id?.toString() || project?.id || review.project?.toString() || review.projectId,
        projectName: project?.name || review.projectName || 'Workspace',
        repository: project?.repository || project?.repositoryUrl || project?.repositoryName || 'workspace',
        branch: project?.branch || review.branch || 'main',
        language: review.language || 'javascript',
        overallScore: score,
        scores: {
            security: Number(categories.security || 0),
            performance: Number(categories.performance || 0),
            maintainability: Number(categories.maintainability || 0),
            readability: Number(categories.readability || 85),
            bestPractices: Number(categories.bestPractices || 80),
        },
        issues: buildReviewIssues(review),
        filesReviewedCount: review.filesReviewedCount || 3,
        status: 'Completed',
        createdAt: review.createdAt || new Date().toISOString(),
        summary: review.summary || '',
        suggestions: review.suggestions || [],
        improvedCode: review.improvedCode || '',
    };
};

export const buildProjectResponse = (project) => ({
    id: project._id?.toString() || project.id,
    name: project.name || '',
    description: project.description || '',
    repository: project.repository || project.repositoryUrl || project.repositoryName || 'workspace',
    branch: project.branch || 'main',
    language: project.language || 'javascript',
    reviewsCount: project.reviewsCount || 0,
    lastReviewed: project.lastReviewed || project.updatedAt || project.createdAt || '',
    score: project.score || 85,
    status: project.status || 'Healthy',
    createdAt: project.createdAt || new Date().toISOString(),
});

export const buildHistoryResponse = (historyDoc) => {
    const review = historyDoc.review || {};
    const project = historyDoc.project || null;
    const payload = buildReviewResponse(
        {
            ...review,
            project: historyDoc.project || review.project,
            projectName: project?.name || review.projectName || 'Workspace',
            branch: project?.branch || review.branch || 'main',
            language: review.language || 'javascript',
        },
        project
    );

    return {
        ...payload,
        id: historyDoc._id?.toString() || historyDoc.id || payload.id,
    };
};

export const buildUserResponse = (user) => ({
    id: user._id?.toString() || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    avatar: user.avatar || '',
    createdAt: user.createdAt || new Date().toISOString(),
});
