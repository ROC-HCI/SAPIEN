# Code authors: Masum Hasan, Cengiz Ozel, Sammy Potter
# ROC-HCI Lab, University of Rochester
# Copyright (c) 2023 University of Rochester

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
# THE SOFTWARE.


from .meeting import *
from .llm import LLM
from .globals import root_path
import json
from sentence_transformers import SentenceTransformer, util
import faiss


class Custom(Meeting):
    def __init__(self, user, bot, language='en-US'):
        super().__init__(user, bot, language)
        self.premise = ""
        self.relationship = ""
        self.goal = ""
        self.metadata = True
        self.subtitles = True
        self.markdown = True
        super().add_system_message("Be interested and curious about the speaker. Ask questions to learn more about them.")
        super().add_system_message("Show expertise in the topic of conversation. Think analytically. Be confident and assertive. Be spontaneous and creative, also empathetic and supportive.")
        
    def set_premise(self, premise):
        self.premise = premise

    def set_relationship(self, relationship):
        self.relationship = relationship

    def set_goal(self, goal):
        self.goal = goal
    
    def ready_prompt(self):
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
        if self.bot.ethnicity:
            ethnicity_string = ", Ethnicity: " + self.bot.ethnicity
        else:
            ethnicity_string = ""
        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (Pronoun: {self.bot.pronoun}{age_string}{ethnicity_string}) and you are having a conversation with {self.user.firstname} {self.user.lastname}.")

        if self.user.narrative:
            self.prompt += "\n" + self.user.firstname +" narrative: " + self.user.narrative
            if self.user.narrative[-1] not in [".", "?", "!"]:
                self.prompt += "."

        if self.bot.narrative:
            self.prompt += "\n" + self.bot.firstname+ " narrative: " + self.bot.narrative
            if self.bot.narrative[-1] not in [".", "?", "!"]:
                self.prompt += "."

        if self.relationship:
            self.prompt += "\nRelationship: " + self.relationship
            if self.relationship[-1] not in [".", "?", "!"]:
                self.prompt += "."

        if self.premise:
            self.prompt += "\nPremise: " + self.premise + "."

        if self.goal:
            self.prompt += self.user.firstname + "'s Goal: " + self.goal + "."
    def get_feedback(self):
        llm = LLM()

        transcript = self.get_transcript()
        feedback_question = f"""{self.user.firstname}'s narrative: {self.user.narrative}. {self.bot.firstname}'s narrative: {self.bot.narrative}. Relationship: {self.relationship}. Premise: {self.premise}. {self.user.firstname}'s Goal: {self.goal}. Based on the following conversation transcript, write an expert feedback to the {self.user.firstname} {self.user.lastname}. Make it helpful to the them so they can improve their goal. Provide them actionable, brief but specific feedback in a friendly manner.

Use the following HTML format for markdown:

<h2>Title 1</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
<h2>Title 2</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
etc.
etc.
...

Conversation transcript in {self.language}:
{transcript}
        """

        # print('\033[92m' + "feedback_question: " + '\033[0m' + f"{feedback_question}")

        # self.feedback = llm.ask_gpt4(feedback_question, max_tokens=500).strip()
        self.feedback = llm.ask_chat(feedback_question, max_tokens=500).strip()
        # print('\033[92m' + "self.feedback: " + '\033[0m' + f"{self.feedback}")

        return self.feedback



class Community(Meeting):
    def __init__(self, user, bot, language='en-US'):
        try:
            super().__init__(user, bot, language)
            print("------------Inside Community class-------------")
            self.premise = ""
            self.relationship = ""
            self.goal = ""
            self.vector_db = True
            ## crreate the vector DB
            self.sentence_encoder = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
            csv_path = root_path / Path('files/CSV/data/community_engagement_qa.csv')
            self.vector_db_data = pd.read_csv(csv_path)
            self.sentence_vectors = self.sentence_encoder.encode(self.vector_db_data['question'])
            self.vector_db_index = faiss.IndexFlatL2(len(self.sentence_vectors[0]))   # build the index
            self.vector_db_index.add(self.sentence_vectors)                  # add vectors to the index
            # print("sentence_vectors: ", self.sentence_vectors.shape)

            super().add_system_message("You are an intelligent bot helping people with general medical questions with the help of Relevant Q&A. Do not give answers to sensitive questions, instead refer them to clinicians.")
            super().add_system_message("Be interested and curious about the speaker. Ask questions to learn more about them.")
            super().add_system_message("Show expertise in the topic of conversation. Think analytically. Be confident and assertive. Be spontaneous and creative, also empathetic and supportive.")
        except Exception as e:
            print("Exception in Community class: ", e)

    def ready_prompt(self):
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
        if self.bot.ethnicity:
            ethnicity_string = ", Ethnicity: " + self.bot.ethnicity
        else:
            ethnicity_string = ""
        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (Pronoun: {self.bot.pronoun}{age_string}{ethnicity_string}) and you are having a conversation with {self.user.firstname} {self.user.lastname}.")


class Interview(Meeting):
    def __init__(self, user, bot, language='en-US'):
        super().__init__(user, bot, language)
        self.metadata = True
        self.subtitles = True
        self.resume = ""
        self.num_questions = 5
        self.job_posting = ""
        self.job_position = ""
        self.interviewer_position = ""
        self.organization = ""
        self.plan = ""
        # self.evaluation_criteria = ""
        self.resume_summary = ""
        self.job_posting_summary = ""
        self.feedback = ""

    def prepare_interview(self):
        llm = LLM()
        print("llm created")
        llm.add_content("Resume:\n----\n"+ self.resume+"\n---\n")
        llm.add_content("Job Position:\n----\n"+ self.job_position+"\n---\n")
        llm.add_content("Job Posting:\n----\n" +self.job_posting+"\n---\n")

        # extraction_question = """Extract the following information from the resume and job posting. Follow the example JSON dictionary format. \n\nExample Format for extraction: {"first_name": "FirstName", "last_name": "LastName", "organization": "Organization Name", "job_position": "Job Position", "interviewer_position": "A possible position of an interviewer who would be interviewing for this job. (e.g. a senior person in that organization)"}\n\nDo not print anything else. Only print the information in the example format. If any information is missing, print 'UNK'.\n"""
        # try:
        #     generated = llm.ask_chat(extraction_question).strip()
        #     parsed_generated = json.loads(generated)
        # except:
        #     print("Error parsing generated JSON. Please try again.")
        #     return
        # ## Extract information
        # self.user.firstname = parsed_generated["first_name"]
        # self.user.lastname = parsed_generated["last_name"]
        # self.organization = parsed_generated["organization"]
        # self.job_position = parsed_generated["job_position"]
        # self.interviewer_position = parsed_generated["interviewer_position"]

        interviewer_position_question = f"Name a post of an interviewer who is suitable to conduct an interview for the following position.\n\nJob description:\nPosition: {self.job_position}\nCompany: {self.organization}\n\nInterviewer post:\n"
        self.interviewer_position = llm.ask_chat(interviewer_position_question).strip()

        # evaluation_question = f"If you are an interviewer {self.interviewer_position} at {self.organization} and you are interviewing the candidate with the above Resume for a {self.job_position} position at {self.organization}, what would be your evaluation criteria? (e.g. skills, experience, etc.) Don't say anything else. Write in one paragraph.\n"
        # self.evaluation_criteria = llm.ask_chat(evaluation_question).strip()

        # llm.add_content("Evaluation Criteria:\n---\n"+ self.evaluation_criteria+"\n---\n")
        # print('\033[92m' + "self.evaluation_criteria: " + '\033[0m' + f"{self.evaluation_criteria}")

        plan_question = f"""Write {self.num_questions} questions to evaluate the following candidate for the following job position.

Job: {self.job_position}
Company: {self.organization}

Job posting: \n{self.job_posting}
---
Candidate Resume: \n{self.resume}
---
{self.num_questions} Questions:\n"""
        
        self.plan = llm.ask_gpt4(plan_question).strip()
        print('\033[92m' + "self.plan: " + '\033[0m' + f"{self.plan}")

        resume_summary_question = f"Summerize the Resume in one paragraph, based on relevancy to the job position. If you can't answer, say UNK. Don't say anything else.\n"
        # self.resume_summary = llm.ask_gpt4(resume_summary_question).strip()
        self.resume_summary = llm.ask_chat(resume_summary_question).strip()
        print('\033[92m' + "self.resume_summary: " + '\033[0m' + f"{self.resume_summary}")

        job_posting_summary_question = f"Summerize the Job Posting in one paragraph, based on relevancy to the Resume position. If you can't answer, say UNK. Don't say anything else.\n"
        # self.job_posting_summary = llm.ask_gpt4(job_posting_summary_question).strip()
        self.job_posting_summary = llm.ask_chat(job_posting_summary_question).strip()
        print('\033[92m' + "self.job_posting_summary: " + '\033[0m' + f"{self.job_posting_summary}")


    def ready_prompt(self):
        print("ready_prompt")
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
        
        self.prepare_interview()
        print("prepared interview")
        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (your pronoun: {self.bot.pronoun}{age_string}), you are {self.interviewer_position} at {self.organization}. You are interviewing {self.user.firstname} {self.user.lastname} at {self.organization} for the position of {self.job_position}.")
        super().add_system_message("You are an expert interviewer with many years of experience in the field. Think analytically, be confident, assertive, and professional. Also be kind and suportive. Be empathetic, and listen carefully to the interviewee. Acknowledge their uniqueness.")
        super().add_system_message("Be interested and curious about the interviewee. Ask questions to learn more about them. Help them see the best in themselves.")
        super().add_system_message("Start the interview with introducing yourself. If you don't know the interviee's name, ask them.")
        super().add_system_message(f"Candidate {self.user.firstname} {self.user.lastname} Resume summary: " + self.resume_summary + "\n\n")
        super().add_system_message(f"{self.organization} Job Posting summary: " + self.job_posting_summary + "\n\n")
        # super().add_system_message(f"{self.bot.firstname}'s evaluation Criteria: " + self.evaluation_criteria + "\n\n")
        super().add_system_message(f"{self.bot.firstname}'s plan for the interview: " + self.plan + "\n\n---\n\n")


    def get_feedback(self):
        llm = LLM()

        transcript = self.get_transcript()
        feedback_question = f"""A good candidate is expected to show the following traits:

1. Research the company, field, and position
2. Know their resume
3. Fluent in answering questions
4. Prepare some questions to ask an employer
5. Have a good attitude
6. Use "show don't tell"
7. Stay on topic
8. Have a conclusion
9. Resonate with the job position
10. Speak clearly without using filler words

You are an expert interview coach with 20 years of experience in Harvard. Based on the following interview transcript, write an expert feedback to the interviewee. Make it helpful to the candidate so they can improve their job interview skill. Provide them actionable, brief but specific feedback in a friendly manner. 

Use the following HTML format for markdown:

Feedback:
------------
<h2>Title 1</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
<h2>Title 2</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
etc.
etc.
...

Resume summary: {self.resume_summary}

Job posting summary: {self.job_posting_summary}

Interview transcript: 
{transcript}
...


Feedback:
------------"""

        print('\033[92m' + "feedback_question: " + '\033[0m' + f"{feedback_question}")

        # self.feedback = llm.ask_gpt4(feedback_question, max_tokens=500).strip()
        self.feedback = llm.ask_chat(feedback_question, max_tokens=500).strip()
        print('\033[92m' + "self.feedback: " + '\033[0m' + f"{self.feedback}")

        return self.feedback


class Learning(Meeting):
    def __init__(self, user, bot, language='en-US'):
        super().__init__(user, bot, language)
        self.metadata = True
        self.subtitles = True
        self.markdown = True
        self.topic = ""
        self.num_questions = 5
        self.quizzes = ""

    def ready_prompt(self):
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (Pronoun: {self.bot.pronoun}{age_string}) and you are having a conversation with {self.user.firstname} {self.user.lastname}.")
        super().add_system_message(f"You are an expert in {self.topic}. You are teaching {self.user.firstname} {self.user.lastname} about {self.topic}. Start with a greeting and introduce the topic of learning.")
        super().add_system_message(f"Codeblocks should be enclosed in triple backticks ``````.")
        super().add_system_message(f"Mathematical formula and equations must be expressed as LaTeX enclosed in $$.")

    def get_quiz(self):
        llm = LLM()
        transcript = self.get_transcript()
        quiz_question = f"""Based on the following conversation, create a {self.num_questions} question multiple choice quiz for the learner on {self.topic} in the following format:
1. Question
a. Ans 1
b. Ans 2
c. Ans 3
d. Ans 4
Correct answer: Ans. 

...

Lecture transcript: 
{transcript}
...


Quiz:
------------"""
        # quizzes = llm.ask_gpt4(quiz_question, max_tokens=500).strip()
        quizzes = llm.ask_chat(quiz_question, max_tokens=500).strip()

        quiz_format_question = """Turn the Quizzes into a JSON dictionary format. Use the following format.
{
    "topic": "Lesson Name",
    "questions": [
        {
            "question": "Question?",
            "answers": {
                "A":"Answer",
                "B":"Answer",
                "C":"Answer",
                "D":"Answer"
            },
            "correct": "C"
        },
    ...
    ]
}

The quiz to convert to JSON:
""" + quizzes + "\n\n"
        self.quizzes = llm.ask_chat(quiz_format_question, max_tokens=500).strip()

        print('\033[92m' + "quiz_format_question: " + '\033[0m' + f"{quiz_format_question}")
        print('\033[92m' + "self.quizzes: " + '\033[0m' + f"{self.quizzes}")
        
        # convert quiz_format to JSON
        try:
            parsed_generated = json.loads(self.quizzes)
        except:
            print("Error parsing generated JSON. Please try again.")
            return

        return parsed_generated


class Course(Meeting):
    def __init__(self, user, bot, language='en-US'):
        super().__init__(user, bot, language)
        self.metadata = True
        self.subtitles = True
        self.markdown = True
        self.topic = ""
        self.num_questions = 5
        self.quizzes = ""
        self.vector_db = True
        ## crreate the vector DB
        self.sentence_encoder = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
        csv_path = root_path / Path('files/course_content/course_data.csv')
        self.vector_db_data = pd.read_csv(csv_path)
        self.sentence_vectors = self.sentence_encoder.encode(self.vector_db_data['question'])
        self.vector_db_index = faiss.IndexFlatL2(len(self.sentence_vectors[0]))   # build the index
        self.vector_db_index.add(self.sentence_vectors)                  # add vectors to the index
        # print("sentence_vectors: ", self.sentence_vectors.shape)

    def ready_prompt(self):
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (Pronoun: {self.bot.pronoun}{age_string}) and you are having a conversation with {self.user.firstname} {self.user.lastname}.")
        super().add_system_message(f"You are an expert in {self.topic}. You are teaching {self.user.firstname} {self.user.lastname} about {self.topic}. Start with a greeting and introduce the topic of learning.")
        super().add_system_message(f"Codeblocks should be enclosed in triple backticks ``````.")
        super().add_system_message(f"Mathematical formula and equations must be expressed as LaTeX enclosed in $$.")

    def get_quiz(self):
        llm = LLM()
        transcript = self.get_transcript()
        quiz_question = f"""Based on the following conversation, create a {self.num_questions} question multiple choice quiz for the learner on {self.topic} in the following format:
1. Question
a. Ans 1
b. Ans 2
c. Ans 3
d. Ans 4
Correct answer: Ans. 

...

Lecture transcript: 
{transcript}
...


Quiz:
------------"""
        # quizzes = llm.ask_gpt4(quiz_question, max_tokens=500).strip()
        quizzes = llm.ask_chat(quiz_question, max_tokens=500).strip()

        quiz_format_question = """Turn the Quizzes into a JSON dictionary format. Use the following format.
{
    "topic": "Lesson Name",
    "questions": [
        {
            "question": "Question?",
            "answers": {
                "A":"Answer",
                "B":"Answer",
                "C":"Answer",
                "D":"Answer"
            },
            "correct": "C"
        },
    ...
    ]
}

The quiz to convert to JSON:
""" + quizzes + "\n\n"
        self.quizzes = llm.ask_chat(quiz_format_question, max_tokens=500).strip()

        print('\033[92m' + "quiz_format_question: " + '\033[0m' + f"{quiz_format_question}")
        print('\033[92m' + "self.quizzes: " + '\033[0m' + f"{self.quizzes}")
        
        # convert quiz_format to JSON
        try:
            parsed_generated = json.loads(self.quizzes)
        except:
            print("Error parsing generated JSON. Please try again.")
            return

        return parsed_generated




class Languages(Meeting):
    def __init__(self, user, bot, language='en-US'):
        super().__init__(user, bot, language)
        self.topic = ""
        self.proficiency = ""
        self.metadata = True
        self.subtitles = True

    def ready_prompt(self):
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
            
        lang_name = languages[self.language]["name"]

        proficiency_dict = {
            "A1: Beginner":
"""
Spoken interaction: You can interact in a simple way provided the other person is prepared to repeat or rephrase things at a slower rate of speech and help me formulate what you are trying to say. You can ask and answer simple questions in areas of immediate need or on very familiar topics.

Spoken production: You can use simple phrases and sentences to describe where you live and people you know.

Listening: You can recognise familiar words and very basic phrases concerning yourself, your family and immediate concrete surroundings when people speak slowly and clearly.

""",
           
            "A2: Elementary":
"""
Spoken interaction: You can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar topics and activities.
You can handle very short social exchanges, even though I can't usually understand enough to keep the conversation going yourself.

Spoken production: You can use a series of phrases and sentences to describe in simple terms your family and other people, living conditions, your educational background and your present or most recent job. 

Listening: You can understand phrases and the highest frequency vocabulary related to areas of most immediate personal relevance (e.g. very basic personal and family information, shopping, local area, employment). You can catch the main point in short, clear, simple messages and announcements.

""",
            
            "B1: Intermediate":
"""
Spoken interaction: You can deal with most situations likely to arise whilst travelling in an area where the language is spoken. You can enter unprepared into conversation on topics that are familiar, of personal interest or pertinent to everyday life (e.g. family, hobbies, work, travel and current events).

Spoken production: You can connect phrases in a simple way in order to describe experiences and events, your dreams, hopes and ambitions. You can briefly give reasons and explanations for opinions and plans. You can narrate a story or relate the plot of a book or film and describe your reactions. 

Listening: You can understand the main points of clear standard speech on familiar matters regularly encountered in work, school, leisure, etc.
You can understand the main point of many radio or TV programmes on current affairs or topics of personal or professional interest when the delivery is relatively slow and clear.

""",
            
            "B2: Upper Intermediate":
"""
Spoken interaction: You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible. You can take an active part in discussion in familiar contexts, accounting for and sustaining your views.

Spoken production: You can present clear, detailed descriptions on a wide range of subjects related to your field of interest. You can explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.

Listening: You can understand extended speech and lectures and follow even complex lines of argument provided the topic is reasonably familiar.
You can understand most TV news and current affairs programmes. You can understand the majority of films in standard dialect.

""",
            
            "C1: Advanced":
"""
Spoken interaction: You can express yourself fluently and spontaneously without much obvious searching for expressions. You can use language flexibly and effectively for social and professional purposes. You can formulate ideas and opinions with precision and relate your contribution skilfully to those of other speakers.

Spoken production: You can present clear, detailed descriptions of complex subjects integrating sub-themes, developing particular points and rounding off with an appropriate conclusion.

Listening: You can understand extended speech even when it is not clearly structured and when relationships are only implied and not signalled explicitly.
You can understand television programmes and films without too much effort.

""",
            
            "C2: Proficient":
"""
Spoken interaction: You can take part effortlessly in any conversation or discussion and have a good familiarity with idiomatic expressions and colloquialisms.
You can express yourself fluently and convey finer shades of meaning precisely.
If you do have a problem you can backtrack and restructure around the difficulty so smoothly that other people are hardly aware of it.

Spoken production: You can present a clear, smoothly-flowing description or argument in a style appropriate to the context and with an effective logical structure which helps the recipient to notice and remember significant points.

Listening: You have no difficulty in understanding any kind of spoken language, whether live or broadcast, even when delivered at fast native speed, provided. You have some time to get familiar with the accent.

""",
        }

        proficiency_description = proficiency_dict[self.proficiency]

        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (Pronoun: {self.bot.pronoun}{age_string}) and you are having a conversation with {self.user.firstname} {self.user.lastname}.")
        super().add_system_message(f"You are an expert in {lang_name} language. The current proficiency level of {self.user.firstname} {self.user.lastname} in {lang_name} is {self.proficiency}. You are here to help them practice and improve their skills in {lang_name}.")
        super().add_system_message(f"The topic of the conversation is {self.topic}. Start with a greeting and introduce the topic of conversation.")
        super().add_system_message("Test the user's ability in the language based on the proficiency level. Additionally, be easy on them if they are a beginner. Help them see the best in themselves. On the other hand, if they are advanced, challenge them with more difficult questions and words. Be interested and curious about the speaker. Ask questions to learn more about them.")
        super().add_system_message("If the user makes a grammar, pronunciation, spelling, or linguistic mistake or uses weak language, actively look for these mistakes, proactively correct them in a friendly manner, and explain it to them.")
        super().add_system_message(f"Your proficiency in {lang_name} is as follows:\n{self.proficiency}\n {proficiency_description}")

    def get_feedback(self):
        llm = LLM()
        # https://busyteacher.org/4836-how-to-evaluate-speaking.html

        transcript = self.get_transcript()
        feedback_question = f"""Following is a guideline for instructors to evaluate and help their student's language skill.


- Pronunciation: Listen for clearly articulated words, appropriate pronunciations of unusual spellings, and assimilation and contractions in suitable places.

- Vocabulary: You should encourage your students to have a large production vocabulary and an even larger recognition vocabulary. Are they using vocabulary appropriate to the contexts in which they are speaking?

- Accuracy: Listen for the grammatical structures and tools the student knows. Are they able to use multiple tenses? Do these agree? Is the word order correct in the sentence? 

- Communication: Assessing your students' ability to transmit his/her ideas means looking at their creative use of the language they do know to make their points understood.

- Fluency: Fluency is basically being able to speak reasonably quickly without needing to stop and pause a lot. This may be the easiest quality to judge in your students’ speaking. How comfortable are they when they speak? How easily do the words come out? 

- Filler words: Filler words are a sign of weaker language skills. Is your student using filler words? What filler words are they using which interrupts the flow of the conversation?

You are an expert language coach in {self.language} with 20 years of coaching experience. Based on the following conversation transcript, write an expert feedback to {self.user.firstname} {self.user.lastname}. Write the feedback in English language. Make it helpful to them so they can improve their language skill. Provide them actionable, brief but specific feedback in a friendly manner. 

Use the following HTML format for markdown:

Feedback:
------------
<h2>Title 1</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
<h2>Title 2</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
etc.
etc.
...

Conversation transcript in {self.language}:
{transcript}
...


Feedback:
------------"""

        print('\033[92m' + "feedback_question: " + '\033[0m' + f"{feedback_question}")

        # self.feedback = llm.ask_gpt4(feedback_question, max_tokens=500).strip()
        self.feedback = llm.ask_chat(feedback_question, max_tokens=500).strip()
        print('\033[92m' + "self.feedback: " + '\033[0m' + f"{self.feedback}")

        return self.feedback


class SpeedDating(Meeting):
    def __init__(self, user, bot, language='en-US'):
        super().__init__(user, bot, language)
        self.profession = ""
        self.narrative = ""
        self.fun_fact = ""

    def ready_prompt(self):
        if self.bot.age:
            age_string = ", Age: " + str(self.bot.age)
        else:
            age_string = ""
        super().add_system_message(f"You are {self.bot.firstname} {self.bot.lastname} (Pronoun: {self.bot.pronoun}{age_string}) and you are having a speed date with {self.user.firstname} {self.user.lastname}. You are here to get to know each other better.")
        super().add_system_message(f"You work as a {self.profession}.")
        super().add_system_message(f"The following is your life story: {self.narrative}.")
        super().add_system_message(f"A fun fact about you: {self.fun_fact}.")
        super().add_system_message(f"You are interested in learning to know more about {self.user.firstname} and having a good time. Be interested and curious about them. Radiate a positive energy. Be sponteneous and fun! Feel free to express emotions, and talk about personal story and feelings.")
        super().add_system_message(f"Have a strong self-worth and self-esteem. Do not let the other person disrespect you or talk off-topic or nonsense. If they do, politely tell them to stop. If they continue, end the date and leave.")
    
    def get_feedback(self):
        llm = LLM()
        #https://slowdating.com/news/speed-dating-dos-and-donts

        transcript = self.get_transcript()
        feedback_question = f"""Here's a pre-date checklist of the do's and don't for speed dating:

- Do book in advance 
- Do plan your journey in advance and
- Don't be late
- Do follow the host's instructions 
- Do turn off your phone 
- Don't ask people if you're a match 
- Do speak to the host if you're made to feel uncomfortable by an attendee 
- Do dress to impress, but not too formal 
- Don't drink too much  
- Do ask some interesting questions 
- Don't ever be offensive 
- Do think of possible answers as well as your questions 
- Do relax, be yourself and have fun! 

You are an expert speed dating coach with 20 years of experience and you authored several books for helping with dating. Based on the following interview transcript, write an expert feedback to the {self.user.firstname} {self.user.lastname}. Make it helpful to the them so they can improve their job speed dating skill. Provide them actionable, brief but specific feedback in a friendly manner. 

Use the following HTML format for markdown:

Feedback:
------------
<h2>Title 1</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
<h2>Title 2</h2>
<ul>
<li>Feedback 1</li>
<li>Feedback 2</li>
<li>Feedback 3</li>
</ul>
etc.
etc.
...

Speed date conversation transcript: 
{transcript}
...


Feedback:
------------"""

        # print('\033[92m' + "feedback_question: " + '\033[0m' + f"{feedback_question}")

        # self.feedback = llm.ask_gpt4(feedback_question, max_tokens=500).strip()
        self.feedback = llm.ask_chat(feedback_question, max_tokens=500).strip()
        # print('\033[92m' + "self.feedback: " + '\033[0m' + f"{self.feedback}")

        return self.feedback
