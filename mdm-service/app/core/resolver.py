import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from difflib import SequenceMatcher
from datetime import datetime
from dateutil import parser

class EntityResolver:
    def __init__(self):
        # In a production system, the vectorizer would be pre-trained on the dataset
        self.vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(2, 3))

    def jaro_winkler_approx(self, s1, s2):
        if not s1 or not s2: return 0.0
        return SequenceMatcher(None, s1.lower(), s2.lower()).ratio()

    def address_similarity(self, addr1, addr2):
        if not addr1 or not addr2: return 0.0
        try:
            # Use TF-IDF Cosine Similarity for addresses
            tfidf = self.vectorizer.fit_transform([addr1.lower(), addr2.lower()])
            return float(np.dot(tfidf[0], tfidf[1].T))
        except:
            return self.jaro_winkler_approx(addr1, addr2)

    def dob_similarity(self, dob1, dob2):
        if not dob1 or not dob2: return 0.0
        try:
            d1 = parser.parse(dob1)
            d2 = parser.parse(dob2)
            diff = abs((d1 - d2).days)
            if diff == 0: return 1.0
            if diff <= 1: return 0.8 # Allow 1 day variance for data entry errors
            return 0.0
        except:
            return 1.0 if dob1 == dob2 else 0.0

    def phone_similarity(self, p1, p2):
        if not p1 or not p2: return 0.0
        # Compare last 4 digits for high reliability
        return 1.0 if p1[-4:] == p2[-4:] else 0.0

    def calculate_total_score(self, req, profile):
        name_score = self.jaro_winkler_approx(req.name, profile.name)
        dob_score = self.dob_similarity(req.dob, profile.dob)
        addr_score = self.address_similarity(req.address, profile.address)
        phone_score = self.phone_similarity(req.phone, profile.phone)

        # Handle missing fields: exclude them from the weighted average
        weights = {'name': 0.35, 'dob': 0.30, 'addr': 0.20, 'phone': 0.15}
        total_weight = 1.0
        weighted_sum = 0.0
        
        if req.name and profile.name:
            weighted_sum += weights['name'] * name_score
        else:
            total_weight -= weights['name']
            
        if req.dob and profile.dob:
            weighted_sum += weights['dob'] * dob_score
        else:
            total_weight -= weights['dob']
            
        if req.address and profile.address:
            weighted_sum += weights['addr'] * addr_score
        else:
            total_weight -= weights['addr']
            
        if req.phone and profile.phone:
            weighted_sum += weights['phone'] * phone_score
        else:
            total_weight -= weights['phone']
            
        return weighted_sum / total_weight if total_weight > 0 else 0.0
