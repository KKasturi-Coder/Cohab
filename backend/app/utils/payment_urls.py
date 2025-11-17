"""
Payment URL Generator
Creates deep links for various payment platforms with minimal fees.

Supported platforms:
- Venmo: Free for friends/family, 3% for goods/services
- PayPal: Free for friends/family (PayPal.me)
- Cash App: Free for standard transfers
- Zelle: Always free (bank-to-bank)
"""

from typing import Optional, Dict, Any
from urllib.parse import quote, urlencode
from decimal import Decimal


class PaymentURLGenerator:
    """Generate payment deep links for various platforms"""
    
    @staticmethod
    def generate_venmo_url(
        username: str,
        amount: float,
        note: Optional[str] = None,
        txn: str = "pay"
    ) -> str:
        """
        Generate Venmo deep link URL
        
        Args:
            username: Venmo username (without @)
            amount: Payment amount
            note: Payment note/description
            txn: Transaction type ('pay' or 'charge')
        
        Returns:
            Venmo deep link URL
        """
        # Clean username (remove @ if present)
        username = username.lstrip('@')
        
        params = {
            'txn': txn,
            'amount': f"{amount:.2f}",
        }
        
        if note:
            params['note'] = note
        
        # Venmo deep link format
        return f"venmo://paycharge?recipients={username}&{urlencode(params)}"
    
    @staticmethod
    def generate_paypal_url(
        email: str,
        amount: float,
        note: Optional[str] = None,
        currency: str = "USD"
    ) -> str:
        """
        Generate PayPal.me URL (free for friends/family)
        
        Args:
            email: PayPal email or PayPal.me username
            amount: Payment amount
            note: Payment note/description
            currency: Currency code
        
        Returns:
            PayPal.me URL
        """
        # Extract username from email if provided
        if '@' in email:
            # For email, we'll use the standard PayPal link
            params = {
                'cmd': '_xclick',
                'business': email,
                'amount': f"{amount:.2f}",
                'currency_code': currency,
                'no_shipping': '1',
            }
            
            if note:
                params['item_name'] = note
            
            return f"https://www.paypal.com/cgi-bin/webscr?{urlencode(params)}"
        else:
            # PayPal.me format (simpler)
            username = email
            url = f"https://www.paypal.me/{username}/{amount:.2f}{currency}"
            return url
    
    @staticmethod
    def generate_cashapp_url(
        cashtag: str,
        amount: float,
        note: Optional[str] = None
    ) -> str:
        """
        Generate Cash App deep link URL
        
        Args:
            cashtag: Cash App $cashtag (with or without $)
            amount: Payment amount
            note: Payment note/description
        
        Returns:
            Cash App deep link URL
        """
        # Clean cashtag (remove $ if present)
        cashtag = cashtag.lstrip('$')
        
        params = {
            'amount': f"{amount:.2f}",
        }
        
        if note:
            params['note'] = note
        
        return f"https://cash.app/${cashtag}/{amount:.2f}"
    
    @staticmethod
    def generate_zelle_url(
        email_or_phone: str,
        amount: float,
        note: Optional[str] = None
    ) -> str:
        """
        Generate Zelle URL
        Note: Zelle doesn't have universal deep links, but most banks support these URLs
        
        Args:
            email_or_phone: Zelle email or phone number
            amount: Payment amount
            note: Payment note/description
        
        Returns:
            Zelle URL (may need to be opened in banking app)
        """
        # Zelle URL format (works with some banking apps)
        # For better UX, we return a generic zelle URL that opens the user's banking app
        return f"https://www.zellepay.com/send?to={quote(email_or_phone)}&amount={amount:.2f}"
    
    @staticmethod
    def generate_payment_url(
        payment_method: str,
        payment_info: Dict[str, Any],
        amount: float,
        note: Optional[str] = None,
        currency: str = "USD"
    ) -> Optional[str]:
        """
        Generate payment URL based on method and info
        
        Args:
            payment_method: Payment method ('venmo', 'paypal', 'cashapp', 'zelle')
            payment_info: Dictionary with payment details
            amount: Payment amount
            note: Payment note/description
            currency: Currency code
        
        Returns:
            Payment URL or None if method not supported
        """
        method = payment_method.lower()
        
        if method == 'venmo' and payment_info.get('venmo_handle'):
            return PaymentURLGenerator.generate_venmo_url(
                payment_info['venmo_handle'],
                amount,
                note
            )
        
        elif method == 'paypal' and payment_info.get('paypal_email'):
            return PaymentURLGenerator.generate_paypal_url(
                payment_info['paypal_email'],
                amount,
                note,
                currency
            )
        
        elif method == 'cashapp' and payment_info.get('cashapp_handle'):
            return PaymentURLGenerator.generate_cashapp_url(
                payment_info['cashapp_handle'],
                amount,
                note
            )
        
        elif method == 'zelle' and payment_info.get('zelle_email'):
            return PaymentURLGenerator.generate_zelle_url(
                payment_info['zelle_email'],
                amount,
                note
            )
        
        return None
    
    @staticmethod
    def get_available_payment_methods(payment_info: Dict[str, Any]) -> list[str]:
        """
        Get list of available payment methods for a user
        
        Args:
            payment_info: Dictionary with payment details
        
        Returns:
            List of available payment methods
        """
        methods = []
        
        if payment_info.get('venmo_handle'):
            methods.append('venmo')
        if payment_info.get('paypal_email'):
            methods.append('paypal')
        if payment_info.get('cashapp_handle'):
            methods.append('cashapp')
        if payment_info.get('zelle_email'):
            methods.append('zelle')
        
        return methods
    
    @staticmethod
    def get_payment_method_fee_info() -> Dict[str, str]:
        """
        Get fee information for each payment method
        
        Returns:
            Dictionary with fee info for each method
        """
        return {
            'venmo': 'Free for friends/family',
            'paypal': 'Free for friends/family',
            'cashapp': 'Free for standard transfers',
            'zelle': 'Always free (bank-to-bank)',
        }
