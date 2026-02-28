"""
Minimal RAG Pipeline Template — ChromaDB + LangChain.

A production-ready starter template for building Retrieval-Augmented Generation
systems. Covers: document loading, chunking, embedding, vector storage, and
retrieval-augmented generation.

Prerequisites:
    pip install langchain langchain-openai chromadb

Usage:
    python rag_starter_template.py
"""

import os


def build_rag_pipeline(
    documents: list[str],
    collection_name: str = "my_knowledge_base",
    chunk_size: int = 500,
    chunk_overlap: int = 50,
):
    """
    Build a complete RAG pipeline from raw text documents.

    Steps:
    1. Split documents into chunks
    2. Embed chunks using OpenAI embeddings
    3. Store in ChromaDB (local persistent vector store)
    4. Return a retriever for querying
    """
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_openai import OpenAIEmbeddings
    from langchain_community.vectorstores import Chroma

    # Step 1: Chunk documents
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.create_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks")

    # Step 2: Embed and store
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory="./chroma_db",
    )
    print(f"Stored {len(chunks)} chunks in ChromaDB")

    return vectorstore


def query_rag(
    vectorstore,
    question: str,
    k: int = 4,
    model: str = "gpt-4o-mini",
) -> dict:
    """
    Query the RAG pipeline: retrieve relevant chunks, then generate an answer.

    Args:
        vectorstore: ChromaDB vector store
        question: User's question
        k: Number of chunks to retrieve
        model: LLM model for generation

    Returns:
        dict with answer, sources, and token usage
    """
    from langchain_openai import ChatOpenAI
    from langchain.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser

    # Step 3: Retrieve relevant chunks
    retriever = vectorstore.as_retriever(
        search_type="mmr",  # Maximum Marginal Relevance for diversity
        search_kwargs={"k": k},
    )
    relevant_docs = retriever.invoke(question)

    # Step 4: Generate answer grounded in context
    context = "\n\n---\n\n".join(doc.page_content for doc in relevant_docs)

    prompt = ChatPromptTemplate.from_template(
        """You are a helpful assistant. Answer the question using ONLY the
context provided below. If the answer is not in the context, say
"I don't have that information."

Context:
{context}

Question: {question}

Answer:"""
    )

    llm = ChatOpenAI(model=model, temperature=0)
    chain = prompt | llm | StrOutputParser()

    answer = chain.invoke({"context": context, "question": question})

    return {
        "answer": answer,
        "sources": [doc.page_content[:100] + "..." for doc in relevant_docs],
        "num_chunks_retrieved": len(relevant_docs),
    }


# ─── Demo ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Sample documents (replace with your own)
    sample_docs = [
        """Our company refund policy allows returns within 30 days of purchase.
        Items must be in original packaging. Digital products are non-refundable.
        Refunds are processed within 5-7 business days to the original payment method.""",
        """Shipping is free for orders over $50. Standard shipping takes 5-7 business
        days. Express shipping (2-3 days) costs $12.99. International shipping is
        available to 40+ countries with delivery in 10-15 business days.""",
        """Our premium plan costs $29/month or $290/year (save 17%). It includes
        unlimited API calls, priority support, custom integrations, and advanced
        analytics. The free plan includes 1,000 API calls per month.""",
    ]

    print("=" * 60)
    print("RAG Pipeline Starter Template")
    print("=" * 60)
    print("\nTo run this demo:")
    print("1. Set OPENAI_API_KEY environment variable")
    print("2. Uncomment the code below")
    print("3. Run: python rag_starter_template.py")

    # Uncomment to run:
    # vectorstore = build_rag_pipeline(sample_docs)
    # result = query_rag(vectorstore, "What is the refund policy?")
    # print(f"\nAnswer: {result['answer']}")
    # print(f"Sources used: {result['num_chunks_retrieved']}")
