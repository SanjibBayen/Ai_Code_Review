import assert from 'node:assert/strict';
import test from 'node:test';

import { getCodeStats, validateCode } from '../src/services/codeAnalysis.service.js';
import { buildProjectResponse, buildReviewResponse } from '../src/utils/transformers.js';
import { validateObjectId } from '../src/middleware/validation.middleware.js';

test('validateCode accepts supported languages and rejects invalid review input', () => {
    assert.deepEqual(validateCode('const ready = true;', 'TypeScript'), { valid: true });
    assert.deepEqual(validateCode('int main() {}', 'C++'), { valid: true });
    assert.deepEqual(validateCode('   ', 'javascript'), { valid: false, message: 'Code is required' });
    assert.deepEqual(validateCode('puts :ok', 'ruby'), {
        valid: false,
        message: 'Unsupported language: ruby',
    });
});

test('getCodeStats reports code and empty lines', () => {
    assert.deepEqual(getCodeStats('first\n\nsecond'), {
        totalLines: 3,
        emptyLines: 1,
        codeLines: 2,
        characters: 13,
    });
});

test('response transformers preserve project and issue details used by the frontend', () => {
    const project = {
        id: 'project-1',
        name: 'Review app',
        repository: 'owner/review-app',
        branch: 'develop',
        language: 'typescript',
    };
    const review = buildReviewResponse({
        id: 'review-1',
        score: 91,
        language: 'typescript',
        categories: { security: 90, performance: 88, maintainability: 92, readability: 93, bestPractices: 91 },
        securityIssues: [{
            title: 'Missing authorization',
            file: 'src/routes.ts',
            line: 12,
            severity: 'high',
            message: 'The route has no authorization check.',
            suggestion: 'Require the appropriate role.',
        }],
    }, project);

    assert.deepEqual(buildProjectResponse(project).repository, 'owner/review-app');
    assert.equal(review.projectId, 'project-1');
    assert.equal(review.issues[0].title, 'Missing authorization');
    assert.equal(review.issues[0].file, 'src/routes.ts');
    assert.equal(review.issues[0].severity, 'ERROR');
});

test('validateObjectId rejects malformed route identifiers before a database query', () => {
    const middleware = validateObjectId();
    let nextCalled = false;
    let response;
    const res = {
        status: (status) => ({ json: (body) => { response = { status, body }; } }),
    };

    middleware({ params: { id: 'not-an-id' } }, res, () => { nextCalled = true; });
    assert.deepEqual(response, { status: 400, body: { success: false, message: 'Invalid id' } });
    assert.equal(nextCalled, false);

    middleware({ params: { id: '507f1f77bcf86cd799439011' } }, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
});
