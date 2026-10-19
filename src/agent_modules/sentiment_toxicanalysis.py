from detoxify import Detoxify
from transformers import pipeline
import pandas as pd

class SentimentToxicAnalysis:
    def __init__(self):
        self.toxicity_model = Detoxify('original')
        self.sentiment_model = pipeline(
            "sentiment-analysis", 
            model="finiteautomata/bertweet-base-sentiment-analysis"
        )

    def analyze_texts(self, user_input_list):
        """Processes a list of strings and returns a combined DataFrame."""
        # 1. Run Toxicity Model (Detoxify)
        tox_results = self.toxicity_model.predict(user_input_list)
        df_toxicity = pd.DataFrame(tox_results, index=user_input_list)

        # 2. Run Sentiment Model (Transformers Pipeline)
        sent_results = self.sentiment_model(user_input_list)

        # 3. Structure Sentiment Data and Track Winning Label
        sent_data = []
        final_labels = []

        for pred in sent_results:
            winning_label = pred['label']
            final_labels.append(winning_label)
            
            # Initialize all columns to 0.0, set winning probability
            row = {"NEG": 0.0, "POS": 0.0, "NEU": 0.0}
            row[winning_label] = pred['score']
            sent_data.append(row)

        df_sentiment = pd.DataFrame(sent_data, index=user_input_list)

        # 4. Combine Both DataFrames and Append Final Sentiment Label
        df_combined = pd.concat([df_toxicity, df_sentiment], axis=1)
        df_combined['final_sentiment'] = final_labels

        # Round numbers for clean viewing
        df_combined = df_combined.round(3)
        return df_combined

    def analyze_single_ticket(self, text: str) -> dict:
        """
        Helper method for LangGraph nodes. 
        Passes a single string, runs the analysis, and converts the 
        resulting DataFrame row back into standard Python dictionaries.
        """
        # Wrap the single text string into a list for your existing function
        df = self.analyze_texts([text])
        
        # Extract the first row as a plain dictionary
        row_dict = df.iloc[0].to_dict()
        return row_dict

# Initialize a single shared instance
analysis_module = SentimentToxicAnalysis()