import OpenAI from "openai";
import { storage } from "../config/storage";
import { env } from "../config/env";
import { z } from "zod";

export const TaskSuggestionsSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      estimatedDays: z.number().optional()
    })
  )
});

export const TaskUpdateSchema = z.object({
  updates: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "blocked", "in_review", "completed"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional()
  })
});

export const ClientInsightsSchema = z.object({
  insights: z.string()
});

export const ProspectiveClientsSchema = z.object({
  prospects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      needs: z.string(),
      approach: z.string()
    })
  )
});

export const TaskAdviceSchema = z.object({
  advice: z.string()
});

export const DashboardInsightsSchema = z.object({
  priorities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      status: z.enum(["pending", "overdue", "completed"])
    })
  ),
  summary: z.string()
});

export const ProjectBlockersSchema = z.object({
  blockers: z.array(
    z.object({
      description: z.string(),
      impact: z.string(),
      mitigation: z.string()
    })
  )
});

export function parseModelResponse<T extends Record<string, any>>(schema: z.ZodSchema<T>, content: string, fallback: T): T & { error?: string } {
  try {
    const json = JSON.parse(content);
    const parsed = schema.safeParse(json);
    if (parsed.success) {
      return parsed.data;
    }
    return { ...fallback, error: "Invalid model response structure" };
  } catch {
    return { ...fallback, error: "Invalid JSON in model response" };
  }
}

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
    
    return parseModelResponse(TaskSuggestionsSchema, content, { tasks: [] });
  } catch (error) {
    console.error("Error generating task suggestions:", error);
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
    
    return parseModelResponse(TaskUpdateSchema, content, { updates: {} });
  } catch (error) {
    console.error("Error processing natural language update:", error);
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
    
    return parseModelResponse(ClientInsightsSchema, content, { insights: "" });
  } catch (error) {
    console.error("Error generating client insights:", error);
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
    
    return parseModelResponse(ProspectiveClientsSchema, content, { prospects: [] });
  } catch (error) {
    console.error("Error searching prospective clients:", error);
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
    
    return parseModelResponse(TaskAdviceSchema, content, { advice: "" });
  } catch (error) {
    console.error("Error getting task advice:", error);
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
    
    return parseModelResponse(DashboardInsightsSchema, content, { priorities: [], summary: "" });
  } catch (error: any) {
    console.error("Error generating dashboard insights:", error);
    return { 
      priorities: [],
      summary: "Unable to generate insights at this time. Please try again later.",
      error: error.message
    };
  }
}

/**
 * Triage email and determine priority/action needed
 */
export async function triageEmail(emailSubject: string, emailBody: string, senderEmail: string) {
  try {
    const prompt = `
      As an AI email triage assistant for a talent management platform, analyze this email and determine its priority and suggested action.
      
      From: ${senderEmail}
      Subject: ${emailSubject}
      Body: ${emailBody}
      
      Categorize this email into one of these priorities:
      - "urgent": Requires immediate response (contract issues, urgent deliverable questions, payment problems)
      - "high": Important but not urgent (new campaign opportunities, deliverable approvals needed)
      - "medium": Normal follow-up needed (status updates, general questions)
      - "low": FYI or can wait (newsletters, general updates)
      
      Also suggest the best action:
      - "reply": Needs a response
      - "review": Needs review but no immediate response
      - "archive": Can be filed away
      - "task": Should create a task/deliverable
      
      Extract any key information like:
      - Campaign mentioned
      - Deliverable mentioned
      - Due dates mentioned
      - Action items
      
      Return in this JSON format:
      {
        "priority": "urgent|high|medium|low",
        "suggestedAction": "reply|review|archive|task",
        "summary": "One-sentence summary of what this email is about",
        "keyPoints": ["Point 1", "Point 2"],
        "extractedData": {
          "campaignName": "if mentioned",
          "deliverableName": "if mentioned",
          "dueDate": "YYYY-MM-DD if mentioned",
          "talentName": "if mentioned"
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
      return { 
        priority: "medium",
        suggestedAction: "review",
        summary: "Unable to analyze email",
        keyPoints: [],
        extractedData: {}
      };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error triaging email:", error);
    return { 
      priority: "medium",
      suggestedAction: "review",
      summary: "Error analyzing email",
      keyPoints: [],
      extractedData: {},
      error: "Failed to triage email"
    };
  }
}

/**
 * Generate smart reply suggestions for an email
 */
export async function generateEmailReply(emailSubject: string, emailBody: string, senderEmail: string, context?: string) {
  try {
    const prompt = `
      As an AI assistant for a talent management professional, generate a professional email reply.
      
      Original Email:
      From: ${senderEmail}
      Subject: ${emailSubject}
      Body: ${emailBody}
      
      ${context ? `Additional context: ${context}` : ''}
      
      Generate 3 different reply options:
      1. "quick": A brief, professional response (1-2 sentences)
      2. "detailed": A thorough, professional response with all details
      3. "friendly": A warm, personable response that builds relationship
      
      Each reply should:
      - Address the sender's needs
      - Be professional and clear
      - Include a clear call-to-action if needed
      
      Return in this JSON format:
      {
        "quick": "Brief reply text",
        "detailed": "Detailed reply text",
        "friendly": "Friendly reply text"
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
        quick: "Thank you for your email. I'll get back to you shortly.",
        detailed: "Thank you for your email. I'll get back to you shortly.",
        friendly: "Thank you for your email. I'll get back to you shortly."
      };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating email reply:", error);
    return { 
      quick: "Thank you for your email. I'll get back to you shortly.",
      detailed: "Thank you for your email. I'll get back to you shortly.",
      friendly: "Thank you for your email. I'll get back to you shortly.",
      error: "Failed to generate reply suggestions"
    };
  }
}

/**
 * Calculate deal health score for a campaign
 */
export async function calculateDealHealth(campaignData: any) {
  try {
    const prompt = `
      As an AI analyst for talent management, calculate a health score for this campaign/deal.
      
      Campaign Data:
      ${JSON.stringify(campaignData, null, 2)}
      
      Analyze these factors:
      - Communication frequency (last touchpoint date vs current date)
      - Deliverable status (on track, at risk, overdue)
      - Payment status (invoices paid, overdue, pending)
      - Contract compliance (usage rights expiring, terms being met)
      - Response time patterns
      
      Calculate a health score from 0-100 where:
      - 80-100: Healthy (green) - Everything on track
      - 60-79: Needs attention (yellow) - Some minor issues
      - 40-59: At risk (orange) - Significant concerns
      - 0-39: Critical (red) - Urgent intervention needed
      
      Return in this JSON format:
      {
        "score": 85,
        "status": "healthy|attention|at_risk|critical",
        "factors": {
          "communication": { "score": 90, "note": "Regular contact" },
          "deliverables": { "score": 80, "note": "On track" },
          "payment": { "score": 85, "note": "Payments current" },
          "compliance": { "score": 85, "note": "All terms met" }
        },
        "risks": ["Risk 1 if any", "Risk 2 if any"],
        "recommendations": ["Action 1", "Action 2"]
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
        score: 50,
        status: "attention",
        factors: {},
        risks: ["Unable to calculate health score"],
        recommendations: ["Review campaign manually"]
      };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calculating deal health:", error);
    return { 
      score: 50,
      status: "attention",
      factors: {},
      risks: ["Error calculating health score"],
      recommendations: ["Review campaign manually"],
      error: "Failed to calculate deal health"
    };
  }
}

/**
 * Generate nudge copy for follow-ups
 */
export async function generateNudgeCopy(context: string, recipientName: string, lastContactDate?: string) {
  try {
    const prompt = `
      As an AI copywriter for talent management, generate a friendly nudge/follow-up message.
      
      Context: ${context}
      Recipient: ${recipientName}
      ${lastContactDate ? `Last contacted: ${lastContactDate}` : ''}
      
      Generate 3 different nudge options:
      1. "gentle": A soft, friendly reminder
      2. "direct": Clear and to-the-point
      3. "urgent": More pressing but still professional
      
      Each should:
      - Be brief (2-3 sentences max)
      - Reference the context naturally
      - Include a clear ask/next step
      - Be appropriate for the time gap since last contact
      
      Return in this JSON format:
      {
        "gentle": "Gentle nudge text",
        "direct": "Direct nudge text",
        "urgent": "Urgent nudge text"
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
        gentle: `Hi ${recipientName}, just checking in on this. Let me know if you need anything!`,
        direct: `Hi ${recipientName}, following up on ${context}. Can you provide an update?`,
        urgent: `Hi ${recipientName}, we need to move forward on ${context}. Please respond ASAP.`
      };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating nudge copy:", error);
    return { 
      gentle: `Hi ${recipientName}, just checking in on this. Let me know if you need anything!`,
      direct: `Hi ${recipientName}, following up on ${context}. Can you provide an update?`,
      urgent: `Hi ${recipientName}, we need to move forward on ${context}. Please respond ASAP.`,
      error: "Failed to generate nudge copy"
    };
  }
}

/**
 * Suggest content ideas based on talent profile and campaign
 */
export async function suggestContentIdeas(talentData: any, campaignBrief?: string) {
  try {
    const prompt = `
      As an AI creative strategist for influencer marketing, suggest content ideas.
      
      Talent Profile:
      ${JSON.stringify(talentData, null, 2)}
      
      ${campaignBrief ? `Campaign Brief: ${campaignBrief}` : ''}
      
      Generate 5 content ideas that:
      - Align with the talent's style and audience
      - Fit the campaign brief (if provided)
      - Are platform-appropriate
      - Include creative hooks and angles
      
      For each idea, provide:
      - Title/hook
      - Brief description
      - Platform recommendation
      - Why it would work
      
      Return in this JSON format:
      {
        "ideas": [
          {
            "title": "Content hook/title",
            "description": "What the content would be",
            "platform": "Instagram|TikTok|YouTube|etc",
            "rationale": "Why this would work"
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { ideas: [] };
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error suggesting content ideas:", error);
    return { 
      ideas: [],
      error: "Failed to generate content suggestions"
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
      return { blockers: [] };
    }

    return parseModelResponse(ProjectBlockersSchema, content, { blockers: [] });
  } catch (error) {
    console.error("Error analyzing project blockers:", error);
    return {
      blockers: [
        {
          description: "Unable to analyze project blockers at this time. Please try again later.",
          impact: "Analysis service is currently unavailable",
          mitigation: "Try refreshing or check your connection"
        }
      ]
    };
  }
}