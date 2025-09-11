import re
from typing import List, Dict, Any
from app.core.config import settings

class SafetyService:
    """Service for handling safety checks and crisis detection"""
    
    def __init__(self):
        self.crisis_keywords = settings.crisis_keywords_list
        self.crisis_patterns = self._compile_crisis_patterns()
    
    def _compile_crisis_patterns(self) -> List[re.Pattern]:
        """Compile crisis detection patterns"""
        patterns = []
        for keyword in self.crisis_keywords:
            # Create pattern that matches the keyword with word boundaries
            pattern = re.compile(rf'\b{re.escape(keyword)}\b', re.IGNORECASE)
            patterns.append(pattern)
        return patterns
    
    def detect_crisis(self, text: str) -> Dict[str, Any]:
        """
        Detect crisis indicators in text
        
        Returns:
            Dict with 'is_crisis', 'severity', 'matched_patterns', and 'response'
        """
        text_lower = text.lower()
        matched_patterns = []
        
        # Check for crisis patterns
        for pattern in self.crisis_patterns:
            if pattern.search(text):
                matched_patterns.append(pattern.pattern)
        
        if matched_patterns:
            severity = self._assess_severity(text, matched_patterns)
            response = self._get_crisis_response(severity)
            
            return {
                "is_crisis": True,
                "severity": severity,
                "matched_patterns": matched_patterns,
                "response": response
            }
        
        return {
            "is_crisis": False,
            "severity": "none",
            "matched_patterns": [],
            "response": None
        }
    
    def _assess_severity(self, text: str, matched_patterns: List[str]) -> str:
        """Assess the severity of crisis indicators"""
        # High severity indicators
        high_severity_patterns = [
            "suicide", "kill myself", "end it", "don't want to live",
            "end my life", "better off dead"
        ]
        
        # Check for high severity patterns
        for pattern in matched_patterns:
            if any(high_sev in pattern.lower() for high_sev in high_severity_patterns):
                return "high"
        
        # Check for multiple crisis indicators
        if len(matched_patterns) > 1:
            return "medium"
        
        return "low"
    
    def _get_crisis_response(self, severity: str) -> str:
        """Get appropriate crisis response based on severity"""
        if severity == "high":
            return "crisis_high"
        elif severity == "medium":
            return "crisis_medium"
        else:
            return "crisis_low"
    
    def validate_message(self, text: str) -> Dict[str, Any]:
        """
        Validate message content for safety
        
        Returns:
            Dict with 'is_valid', 'reason', and 'sanitized_text'
        """
        if not text or not isinstance(text, str):
            return {
                "is_valid": False,
                "reason": "Empty or invalid message",
                "sanitized_text": ""
            }
        
        # Check message length
        if len(text) > settings.MAX_MESSAGE_LENGTH:
            return {
                "is_valid": False,
                "reason": f"Message too long (max {settings.MAX_MESSAGE_LENGTH} characters)",
                "sanitized_text": text[:settings.MAX_MESSAGE_LENGTH]
            }
        
        # Basic sanitization
        sanitized_text = self._sanitize_text(text)
        
        return {
            "is_valid": True,
            "reason": None,
            "sanitized_text": sanitized_text
        }
    
    def _sanitize_text(self, text: str) -> str:
        """Basic text sanitization"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove potential HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        return text

class ModerationService:
    """Service for content moderation"""
    
    def __init__(self):
        self.toxicity_patterns = self._compile_toxicity_patterns()
    
    def _compile_toxicity_patterns(self) -> List[re.Pattern]:
        """Compile toxicity detection patterns"""
        # Basic toxicity patterns - in production, this would be more comprehensive
        toxicity_keywords = [
            "hate", "stupid", "idiot", "moron", "worthless", "useless",
            "kill you", "hurt you", "attack", "violence", "abuse"
        ]
        
        patterns = []
        for keyword in toxicity_keywords:
            pattern = re.compile(rf'\b{re.escape(keyword)}\b', re.IGNORECASE)
            patterns.append(pattern)
        
        return patterns
    
    def moderate_content(self, text: str) -> Dict[str, Any]:
        """
        Moderate content for toxicity and inappropriate language
        
        Returns:
            Dict with 'decision', 'confidence', 'reason', and 'flagged_content'
        """
        text_lower = text.lower()
        flagged_content = []
        
        # Check for toxicity patterns
        for pattern in self.toxicity_patterns:
            matches = pattern.findall(text_lower)
            if matches:
                flagged_content.extend(matches)
        
        # Make moderation decision
        if flagged_content:
            confidence = min(len(flagged_content) * 0.3, 1.0)  # Simple confidence scoring
            decision = "block" if confidence > 0.5 else "review"
            
            return {
                "decision": decision,
                "confidence": confidence,
                "reason": f"Detected potentially inappropriate content: {', '.join(set(flagged_content))}",
                "flagged_content": list(set(flagged_content))
            }
        
        return {
            "decision": "allow",
            "confidence": 0.9,
            "reason": "Content appears appropriate",
            "flagged_content": []
        }

# Create service instances
safety_service = SafetyService()
moderation_service = ModerationService()
