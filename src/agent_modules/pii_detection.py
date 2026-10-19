from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from typing import Dict, Any
from langgraph.supportticket_state import SupportTicketState


class PII_Detection_Module:

    def __init__(self):
        # Initialize any necessary components for PII detection
        # 1. Initialize the engines
        configuration = {
            "nlp_engine_name": "spacy",
            "models": [
                {
                    "lang_code": "en",
                    "model_name": "en_core_web_lg"
                }
            ]
        }
        provider = NlpEngineProvider(nlp_configuration=configuration)
        nlp_engine = provider.create_engine()

        self.analyzer = AnalyzerEngine(
            nlp_engine=nlp_engine,
            supported_languages=["en"]
        )
        self.anonymizer = AnonymizerEngine()

    def analyse_input_for_pii(self, user_input):
        # 2. Detect PII entities
        analyzer_results = self.analyzer.analyze(
            text=user_input, language="en")
        print(analyzer_results)
        return analyzer_results

    def anonymize_input(self, user_input, analyzer_results=None):
        # Fallback: If results aren't passed, run detection on the fly
        if analyzer_results is None:
            analyzer_results = self.analyse_input_for_pii(user_input)
        # 3. Anonymize the text based on detection results
        anonymized_result = self.anonymizer.anonymize(
            text=user_input,
            analyzer_results=analyzer_results
        )
        print(anonymized_result.text)
        return anonymized_result.text


pii_module = PII_Detection_Module()
