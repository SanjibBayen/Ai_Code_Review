import Project from '../models/Project.js';
import { buildProjectResponse } from '../utils/transformers.js';

const respondWithError = (res, status, message, error = null) => {
    return res.status(status).json({
        success: false,
        message,
        error: error || message,
    });
};

export const createProject = async (req, res) => {
    try {
        const { name, description, language, repository, branch } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return respondWithError(res, 400, 'Project name is required');
        }

        if (typeof language !== 'string' || !language.trim()) {
            return respondWithError(res, 400, 'Project language is required');
        }

        const newProject = new Project({
            user: req.user._id,
            name: name.trim(),
            description: description || '',
            language: language.trim(),
            repository: repository || '',
            branch: branch || 'main',
        });

        const savedProject = await newProject.save();

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: buildProjectResponse(savedProject),
        });
    } catch (error) {
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const getUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            message: 'Projects fetched successfully',
            projects: projects.map((project) => buildProjectResponse(project)),
        });
    } catch (error) {
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const getOneProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
        if (!project) {
            return respondWithError(res, 404, 'Project not found');
        }

        return res.status(200).json({
            success: true,
            message: 'Project fetched successfully',
            project: buildProjectResponse(project),
        });
    } catch (error) {
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const updateProject = async (req, res) => {
    try {
        const allowedFields = ['name', 'description', 'language', 'repository', 'branch'];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
        );
        const project = await Project.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, {
            new: true,
            runValidators: true,
        });
        if (!project) {
            return respondWithError(res, 404, 'Project not found');
        }
        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project: buildProjectResponse(project),
        });
    } catch (error) {
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!project) {
            return respondWithError(res, 404, 'Project not found');
        }
        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
            project: buildProjectResponse(project),
        });
    } catch (error) {
        return respondWithError(res, 500, 'Server error', error.message);
    }
};
