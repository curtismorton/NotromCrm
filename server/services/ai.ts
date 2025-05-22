import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate task suggestions based on project description
export async function generateTaskSuggestions(projectDescription: string, projectName: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert project manager who helps break down projects into actionable tasks. Provide 3-5 specific tasks that would help accomplish the project objective.",
        },
        {
          role: "user",
          content: `Project name: ${projectName}\nProject description: ${projectDescription}\n\nPlease suggest specific tasks to accomplish this project.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error generating task suggestions:", error);
    throw new Error("Failed to generate task suggestions");
  }
}

// Process natural language updates for tasks
export async function processNaturalLanguageUpdate(taskId: number, currentStatus: string, naturalLanguageUpdate: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a task management assistant that processes natural language updates and converts them into structured task updates. Extract details like status changes, priority changes, notes, etc.",
        },
        {
          role: "user",
          content: `Task ID: ${taskId}\nCurrent status: ${currentStatus}\nUpdate: ${naturalLanguageUpdate}\n\nPlease extract structured updates from this natural language request.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error processing natural language update:", error);
    throw new Error("Failed to process natural language update");
  }
}

// Generate client insights from data
export async function generateClientInsights(clientData: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a CRM analyst that provides insights about clients based on their data. Identify opportunities, risks, and suggestions for client management.",
        },
        {
          role: "user",
          content: `Client data: ${JSON.stringify(clientData)}\n\nPlease provide insights about this client based on their data.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error generating client insights:", error);
    throw new Error("Failed to generate client insights");
  }
}

// Search for prospective clients based on criteria
export async function searchProspectiveClients(industry: string, criteria: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a business development assistant that helps identify potential clients based on industry and criteria. Generate profiles for potential leads that would be a good fit.",
        },
        {
          role: "user",
          content: `Industry: ${industry}\nCriteria: ${criteria}\n\nPlease suggest potential clients that fit these criteria.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error searching for prospective clients:", error);
    throw new Error("Failed to search for prospective clients");
  }
}

// Get AI advice on completing tasks
export async function getTaskAdvice(taskDescription: string, taskStatus: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a productivity expert that provides advice on completing tasks efficiently. Suggest approaches, tools, or methods to complete the task.",
        },
        {
          role: "user",
          content: `Task description: ${taskDescription}\nCurrent status: ${taskStatus}\n\nPlease provide advice on completing this task efficiently.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error getting task advice:", error);
    throw new Error("Failed to get task advice");
  }
}