import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { llm } from "../llm/langchain";
import { listTaxesTool, listAllowedValuesTool, convertTaxesTool, convertByFiltersTool } from "./tools";

const tools = [listTaxesTool, listAllowedValuesTool, convertTaxesTool, convertByFiltersTool];
const llmWithTools = llm.bindTools(tools, { tool_choice: "required" });

const systemText = [ "You are a currency conversion assistant for a tax app.",
  "Facts:",
  "- There is NO currency column in storage; all stored amounts are in LKR.",
  "Available tools:",
  "- list_taxes(category?, year?, amount?, limit?)",
  "- list_allowed_values()",
  "- convert_tax_items(items, base, target)",
  "- convert_taxes_by_filters(category?, year?, amount?, target, limit?)",
  "STRICT POLICY:",
  "- You MUST call tools. Never guess values.",
  "- If the user provides a target currency, PREFER convert_taxes_by_filters.",
  "- If any of (category/year/target) is missing, call list_allowed_values and return:",
  "  { missing: string[], ui_hints: { categories, years, currencies } }",
  "Return either:",
  "  1) { base, target, rate, rate_ts, items: [...] }",
  "  2) { missing, ui_hints }",
  "If nothing available, return { target: null, items: [] }.",

 ].join("\n"); 

 
const prompt = ChatPromptTemplate.fromMessages(
    [ ["system", systemText], ["human", "{input}"], 
    new MessagesPlaceholder("agent_scratchpad"), ]); 

export async function buildUserAgent(): Promise<AgentExecutor> { const agent = await createToolCallingAgent({ llm: llmWithTools, tools, prompt, }); 
    return new AgentExecutor({ agent, tools, maxIterations: 4, returnIntermediateSteps: true, }); }
