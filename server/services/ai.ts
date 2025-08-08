import OpenAI from "openai";
import { storage } from "../config/storage";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Generate task suggestions based on project description
 */
export async function generateTaskSuggestions(projectDescription: string, projectName: string) {
  try {
    const prompt = `
      As an AI project manager, analyze the following project description and generate 4-6 realistic tasks that would be needed to complete this project.
      
      Project: ${projectName}
      Description: ${projectDescription}
      
      For each task, include:
      1. A clear, concise title (max 60 chars)
      2. A brief description of what needs to be done (1-2 sentences)
      3. A suggested priority (low, medium, or high)
      4. An estimated timeline in days (if possible to determine)
      
      Return the response in this JSON format:
      { "tasks": [ { "title": "Task name", "description": "Task description", "priority": "medium", "estimatedDays": 3 } ] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { tasks: [] };
    }
    
    return JSON.parse(content);
  } catch (error) {
    logger.error("Error generating task suggestions:", error);
    return { 
      tasks: [],
      error: "Failed to generate task suggestions. Please try again later."
    };
  }
}

/**
 * Process natural language task updates
 */
export async function processNaturalLanguageUpdate(taskId: number, currentStatus: string, naturalLanguageUpdate: string) {
  try {
    const task = await storage.getTask(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const prompt = `
      You are an AI assistant that translates natural language task updates into structured data for a CRM system.
      
      Current task details:
      - Title: ${task.title}
      - Status: ${task.status}
      - Priority: ${task.priority}
      - Due date: ${task.dueDate ? new Date(task.dueDate).toISOString() : "Not set"}
      - Description: ${task.description || "No description"}
      
      User's update request: "${naturalLanguageUpdate}"
      
      Based on this natural language update, extract the structured changes the user wants to make.
      Only include fields that need to be changed.
      
      Possible status values: "todo", "in_progress", "blocked", "in_review", "completed"
      Possible priority values: "low", "medium", "high"
      
      Return ONLY the JSON object with the updates in this format:
      {
        "updates": {
          "title": "New title if changed",
          "description": "New description if changed",
          "status": "new_status if changed",
          "priority": "new_priority if changed",
          "dueDate": "2025-05-30T00:00:00.000Z if changed",
          "assignedTo": "New assignee if changed"
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { updates: {} };
    }
    
    return JSON.parse(content);
  } catch (error) {
    logger.error("Error processing natural language update:", error);
    return { 
      updates: {},
      error: "Failed to process natural language update. Please try again later."
    };
  }
}

/**
 * Generate insights about a client
 */
export async function generateClientInsights(clientData: any) {
  try {
    const prompt = `
      As an AI business analyst, analyze the following client data and generate insights:
      
      Client Data:
      ${JSON.stringify(clientData, null, 2)}
      
      Generate insights about:
      1. Client engagement level
      2. Potential upsell opportunities
      3. Risk factors
      4. Recommended next actions
      
      Return the response in this JSON format:
      { "insights": "Detailed analysis text here" }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { insights: "No insights available at this time." };
    }
    
    return JSON.parse(content);
  } catch (error) {
    logger.error("Error generating client insights:", error);
    return { 
      insights: "Unable to generate insights at this time. Please try again later.",
      error: error.message
    };
  }
}

/**
 * Search for prospective clients based on industry and criteria
 */
export async function searchProspectiveClients(industry: string, criteria: string) {
  try {
    const prompt = `
      As an AI lead generation specialist, help find potential clients based on the following criteria:
      
      Industry: ${industry}
      Search criteria: ${criteria}
      
      Generate 3-5 fictitious but realistic potential client profiles that match these criteria.
      For each prospect, include:
      1. Company name
      2. Brief description of their business
      3. Why they might need our services
      4. Suggested approach for contacting them
      
      Return the response in this JSON format:
      { "prospects": [ { "name": "Company name", "description": "Description", "needs": "Service needs", "approach": "Contact strategy" } ] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { prospects: [] };
    }
    
    return JSON.parse(content);
  } catch (error) {
    logger.error("Error searching prospective clients:", error);
    return { 
      prospects: [],
      error: "Failed to search for prospective clients. Please try again later."
    };
  }
}

/**
 * Get advice for a specific task
 */
export async function getTaskAdvice(taskDescription: string, taskStatus: string, prompt?: string) {
  try {
    const promptText = `
      As an AI task management expert, provide advice for the following task:
      
      Task description: ${taskDescription}
      Current status: ${taskStatus}
      User prompt: ${prompt || "Provide general advice for completing this task efficiently"}
      
      Provide specific, actionable advice to help the user complete this task more effectively.
      
      Return the response in this JSON format:
      { "advice": "Detailed advice text here" }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: promptText }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { advice: "No advice available at this time." };
    }
    
    return JSON.parse(content);
  } catch (error) {
    logger.error("Error getting task advice:", error);
    return { 
      advice: "Unable to generate advice at this time. Please try again later.",
      error: error.message
    };
  }
}

/**
 * Generate dashboard insights based on current data
 */
export async function generateDashboardInsights(dashboardData: any) {
  try {
    const prompt = `
      As an AI assistant for a CRM system, analyze the following dashboard data and provide insights and recommendations:
      
      Dashboard Data: ${JSON.stringify(dashboardData.contextInfo)}
      
      ${dashboardData.prompt ? `User's specific question: ${dashboardData.prompt}` : ''}
      
      Based on this information:
      1. Identify key priorities that need attention
      2. Suggest next actions for the user
      3. Highlight any potential issues or opportunities
      
      Format your response as specific, actionable items that the user should focus on.
      
      Return the response in this JSON format:
      { 
        "priorities": [
          { 
            "title": "Priority title", 
            "description": "Priority description", 
            "status": "pending|overdue|completed" 
          }
        ],
        "summary": "Brief summary of the overall situation"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { 
        priorities: [],
        summary: "No insights available at this time."
      };
    }
    
    return JSON.parse(content);
  } catch (error: any) {
    logger.error("Error generating dashboard insights:", error);
    return { 
      priorities: [],
      summary: "Unable to generate insights at this time. Please try again later.",
      error: error.message
    };
  }
}

/**
 * Analyze project for potential blockers
 */
export async function analyzeProjectBlockers(project: any, tasks: any[], devPlan?: any) {
  try {
    const projectData = {
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      deadline: project.deadline,
      completedDate: project.completedDate,
      taskCount: tasks.length,
      taskStatusBreakdown: {
        todo: tasks.filter(t => t.status === "todo").length,
        in_progress: tasks.filter(t => t.status === "in_progress").length,
        review: tasks.filter(t => t.status === "review").length,
        completed: tasks.filter(t => t.status === "completed").length
      },
      devPlan: devPlan ? {
        currentStage: devPlan.currentStage,
        planningStartDate: devPlan.planningStartDate,
        planningEndDate: devPlan.planningEndDate,
        buildStartDate: devPlan.buildStartDate,
        buildEndDate: devPlan.buildEndDate,
        reviseStartDate: devPlan.reviseStartDate,
        reviseEndDate: devPlan.reviseEndDate,
        liveStartDate: devPlan.liveStartDate
      } : null
    };

    const promptText = `
      As an AI project management expert, analyze the following project data and identify potential blockers or issues that might affect project success:
      
      Project Data:
      ${JSON.stringify(projectData, null, 2)}
      
      Based on this data, identify 3-5 potential blockers or issues that might delay or derail this project.
      Consider factors like timeline constraints, task distribution, missing information, and development plan progression.
      
      For each blocker, provide:
      1. A brief description of the potential issue
      2. Why it could be a problem
      3. A suggested mitigation strategy
      
      Return the response in this JSON format:
      { "blockers": [ { "description": "Issue description", "impact": "Why it's a problem", "mitigation": "How to address it" } ] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: promptText }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }
    
    const result = JSON.parse(content);
    return result.blockers || [];
  } catch (error) {
    logger.error("Error analyzing project blockers:", error);
    return [
      {
        description: "Unable to analyze project blockers at this time. Please try again later.",
        impact: "Analysis service is currently unavailable",
        mitigation: "Try refreshing or check your connection"
      }
    ];
  }
}