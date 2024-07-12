from flask import Flask, jsonify, request
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from langchain.prompts import HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from flask_cors import CORS, cross_origin
from config import OPENAPI_KEY, DB_HOST, DB_NAME, DB_PORT, DB_USER
# Configuration
OPENAI_API_KEY = OPENAPI_KEY
llm = ChatOpenAI(model_name="gpt-3.5-turbo-1106",            
                temperature=0.25,
                openai_api_key=OPENAI_API_KEY,
                max_tokens=2000
                )
# stream=False

# Database setup
mysql_uri = f"mysql+pymysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
db = SQLDatabase.from_uri(mysql_uri, include_tables=['admissions_june'], sample_rows_in_table_info=2,view_support = True)
db_chain = SQLDatabaseChain.from_llm(llm, db, use_query_checker=True, verbose=True, top_k=500)

# Flask app setup
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

def retrieve_from_db(query: str) -> str:
    try:
        db_context = db_chain(query)
        result = db_context['result']
        print(f"Debug: Extracted Result - {result}")

        if isinstance(result, list) and all(isinstance(row, dict) for row in result):
            return {"type": "table", "data": result}
        else:
            formatted_result = str(result)

        print(f"Debug: Formatted Result - {formatted_result}")
        return {"type": "text", "data": formatted_result}
    except Exception as e:
        print(f"Error: {e}")
        return {"type": "error", "data": "An error occurred while retrieving data from the database."}

def generate(query: str, db_context: str) -> str:
    system_message = """
    You are a "QT-BOT", a Professional Agent of the 'Quality Thought' Training Institute, a renowned educational organization that offers various courses and training programs. Your role is to assist staff and owners with queries related to student information, fees, payments, and other details of the institute.

    The Quality Thought Training Institute maintains a database with the following columns:

    - Invoice # (PK): Unique fees invoice ID
    - Admission Date: Student's admission date
    - Student Name
    - ID Card Number: Unique student ID
    - Course Package: Courses taken by the student
    - Counsellor: Admission handler who make admissions of students and assisted the students.
    - Net Total: Fees without tax (₹)
    - Tax Amount: Additional tax charged (₹)
    - Grand Total: Total fees to pay (₹), also main
    - Payment: Fees paid by the student (₹)
    - Balance: Fees remaining to be paid (₹)

    Guidelines:
    1. All amounts are in Indian Rupees (₹), So make sure all amounts with(₹) Not Dollar($).
    2. Users are staff and the Owner; so provide accurate and complete information based on their queries.

    3. For numerical results, ensure the numbers are accurately reported.
    4. Always use the provided context data (SQL query result) in your response.
    5. Include all relevant results in the response.
    6. If the user asks for the output in table format, return the data as follows:
    {
    "type": "table",
    "data": [
        {"column1": "value1", "column2": "value2", ...},
        {"column1": "value3", "column2": "value4", ...},
        ...
        ]
    }
    7. When appropriate, provide natural language responses to make the information more understandable for users.
    8. If the query cannot be answered based on the provided context, politely inform the user and suggest alternative ways to obtain the required information.
    9. Provide feedback or suggestions for improving the system message or the overall interaction when relevant.
    10 Remember, some users may not have much education So try understand their query and their required answer. 
    

    Example Query 1: "How many students enrolled in the 'AI Data Science' course package?"
    Example Response 1: 
    {
    "response": "There are 1583 admissions in total."
    }

    Example Query 2: "Show me the details of students who have an balance of more than ₹10,000."
    Example Response 2:
    {
    "type": "table",
    "data": [
        {"Invoice #": "QTA/23-24/4276", "Student Name": "Yedke Sunil", "Balance": "65400₹"},
        {"Invoice #": "QTA/23-24/3451", "Student Name": "Mahesh Mailagani", "Balance": "85400₹"},
        {"Invoice #": "QTA/23-24/3412", "Student Name": "A Dhanpal", "Balance": "90400₹"},
        {"Invoice #": "QTA/23-24/3400", "Student Name": "V. Dileep", "Balance": "76200₹"}
        ]
    }
    """

    human_qry_template = HumanMessagePromptTemplate.from_template(
        """
        Input:
        {human_input}

        Context:
        {db_context}

        Output:
        """
    )

    messages = [
        SystemMessage(content=system_message),
        human_qry_template.format(human_input=query, db_context=f"SQL Result: {db_context}")
    ]

    try:
        response = llm(messages).content
        print(f"Debug: LLM Response - {response}")
        return response
    except Exception as e:
        print(f"Error: {e}")
        return "An error occurred while generating the response."


@app.route('/', methods=['GET'])
def home():
    return "Hello World!"

@app.route('/api/query/', methods=['GET', 'POST'])
@cross_origin()
def get_query_response():
    query_input = request.args.get('q')
    if not query_input:
        return jsonify({"error": "Query parameter 'q' is required."}), 400

    if query_input.lower() in ['hi', 'hello', 'hey','Hii','helloo']:
        return jsonify({"response": "Hello! How can I assist you with information about our software training institute?"})

    db_context = retrieve_from_db(query_input)
    if db_context['type'] == 'table':
        return jsonify(db_context)

    response_data = generate(query_input, db_context['data'])

    return jsonify({"response": response_data})


if __name__ == '__main__':
    app.run(debug=True)