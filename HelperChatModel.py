import os
import traceback
import json
import requests
from typing import List, Tuple

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

import chromadb
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings

import dotenv
from supabase import create_client, Client

# Load environment variables
dotenv.load_dotenv()

# --- 1. RAG TOOL SETUP ---
# Initialize embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# Setup Chroma DB
def setup_rag():
    try:
        if not os.path.exists("./chroma_db"):
            print("Initializing RAG database...")
            loader = TextLoader("calorie_ai_knowledge_base.txt")
            docs = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            splits = text_splitter.split_documents(docs)
            vectorstore = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory="./chroma_db")
            return vectorstore
        else:
            return Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)
    except Exception as e:
        print(f"RAG Setup Error: {e}")
        return None

vectorstore = setup_rag()

@tool
def retrieve_platform_info(query: str) -> str:
    """Useful for answering questions about the Calorie AI platform, its features, pricing, or FAQ."""
    if not vectorstore:
        return "Error: Knowledge base unavailable."
    docs = vectorstore.similarity_search(query, k=2)
    if not docs:
        return "No relevant platform information found."
    return "\n\n".join([d.page_content for d in docs])

# --- 2. WEB SEARCH TOOL ---
@tool
def search_web(query: str) -> str:
    """Useful for answering questions about real-time fitness, nutrition, or general world facts."""
    try:
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
            return "Error: SERPER_API_KEY not found."

        url = "https://google.serper.dev/search"
        payload = json.dumps({"q": query})
        headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }

        response = requests.post(url, headers=headers, data=payload, timeout=10)
        response.raise_for_status()
        search_results = response.json()

        results = []
        if 'organic' in search_results:
            for item in search_results['organic'][:3]:
                results.append(f"Title: {item.get('title')}\nSnippet: {item.get('snippet')}")
        
        if results:
            return "\n\n".join(results)
        return "No search results found."
    except Exception as e:
        return f"Error performing search: {str(e)}"

# --- 3. SUPABASE DB TOOL ---
@tool
def query_supabase_user_data(email: str) -> str:
    """Useful for retrieving user-specific data from the database, like their profile or predictions. You MUST provide the user's email."""
    try:
        # Check environment variables
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        # Fallback to frontend anon key if backend key is missing (for demo purposes)
        if not url:
            url = 'https://rmbyddamnwoobmutwtql.supabase.co'
            key = 'sb_publishable_Y3Pf_PzMnLLD1NPqJqHUfA_yahKManX'
            
        supabase: Client = create_client(url, key)
        
        # Note: Since we don't know the exact table structure yet, we will perform a mock summary
        # In a real app, this would query a specific table like `profiles` or `predictions`
        return f"User Data for {email}:\n- Subscription: Premium\n- Last predicted burn: 2,450 Kcal\n- Goal: Weight Loss\n(Mocked response from database)"
    except Exception as e:
        return f"Database query failed: {str(e)}"

# Define all available tools
tools = [retrieve_platform_info, search_web, query_supabase_user_data]

def initialize_helper_agent():
    """Initialize the Helper AI agent with tools"""
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            return None

        # Initialize the language model
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.0,
            api_key=groq_key
        )

        system_prompt = f"""You are the Calorie AI Helper, a friendly and concise fitness assistant.
        You have access to three tools:
        1. search_web: Use this for real-time fitness/nutrition information.
        2. retrieve_platform_info: Use this for questions about how Calorie AI works, pricing, or FAQ.
        3. query_supabase_user_data: Use this when the user asks about their own data, predictions, or profile.
        
        Guidelines:
        - CRITICAL: You MUST use the `retrieve_platform_info` tool to gather facts about the Calorie AI platform BEFORE answering ANY questions about how it works, its accuracy, or its features. Do NOT guess or use general knowledge.
        - Always use the appropriate tool before answering if you don't know the specific answer.
        - Keep your final answers short, concise, and friendly.
        - Format your text nicely using markdown.
        - Important: The current user's email is {{user_email}}. Pass this exactly when querying their data.
        - CRITICAL: When using a tool, you must use the standard native tool calling format. DO NOT use XML tags or `<function=...>` syntax.
        """

        # langgraph's create_react_agent uses the model and tools directly
        agent_executor = create_react_agent(llm, tools, prompt=system_prompt)
        
        print("Helper Multi-Agent initialized successfully with LangGraph")
        return agent_executor

    except Exception as e:
        print(f"Failed to initialize Helper Multi-Agent: {e}")
        traceback.print_exc()
        return None

# Initialize the agent
helper_agent = initialize_helper_agent()

def helper_chat_function(user_input: str, chat_history: List[Tuple[str, str]], user_email: str = "guest@example.com") -> Tuple[List[Tuple[str, str]], str]:
    """Main chat function for the floating helper widget"""
    if not helper_agent:
        error_msg = "❌ Calorie AI Helper is not available. Please check your API keys."
        chat_history.append((user_input, error_msg))
        return chat_history, ""

    try:
        # First interaction greeting
        if not chat_history and not user_input.strip():
            greeting = "Hello! 👋 I'm your Calorie AI Assistant. I can search the web, check your account data, or answer questions about the platform. How can I help?"
            chat_history.append(("", greeting))
            return chat_history, ""

        if user_input.strip():
            # Format chat history for LangChain
            formatted_history = []
            for u, b in chat_history:
                if u: formatted_history.append(HumanMessage(content=u))
                if b: formatted_history.append(AIMessage(content=b))
                
            # For langgraph react agent, we just pass the message history
            # The system prompt has `{user_email}` which needs formatting, but state_modifier 
            # in langgraph is static. A better way is to pass user_email in the last HumanMessage.
            
            # Since the state_modifier is static, we'll append context to the user's message
            context_injected_input = f"[System Context: The current user's email is {user_email}]\n\nUser Message: {user_input}"
            formatted_history.append(HumanMessage(content=context_injected_input))
                
            # Get response from the agent
            response = helper_agent.invoke({
                "messages": formatted_history
            })
            
            # The output in langgraph is the last message in the list
            final_message = response["messages"][-1].content
            chat_history.append((user_input, final_message))

        return chat_history, ""

    except Exception as e:
        error_msg = f"❌ I encountered an issue: {str(e)}"
        chat_history.append((user_input, error_msg))
        print(f"Error in helper_chat_function: {e}")
        return chat_history, ""
