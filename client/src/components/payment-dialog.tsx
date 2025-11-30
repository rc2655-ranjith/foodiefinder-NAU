import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Calendar, Lock, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantName: string;
  amount?: string;
}

export function PaymentDialog({ open, onOpenChange, restaurantName, amount = "50.00" }: PaymentDialogProps) {
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [displayCardNumber, setDisplayCardNumber] = useState("");

  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const validateExpiry = (expiry: string): boolean => {
    if (expiry.length !== 5 || !expiry.includes('/')) return false;
    const [month, year] = expiry.split('/');
    
    if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) return false;
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (isNaN(monthNum) || isNaN(yearNum)) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cardName.trim()) {
      toast({
        title: "Invalid Cardholder Name",
        description: "Please enter a valid cardholder name.",
        variant: "destructive",
      });
      return;
    }
    
    const cleanedCardNumber = formData.cardNumber.replace(/\D/g, "");
    if (!cleanedCardNumber || !/^\d+$/.test(cleanedCardNumber)) {
      toast({
        title: "Invalid Card Number",
        description: "Card number must contain only digits.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateCardNumber(formData.cardNumber)) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateExpiry(formData.expiry)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Card has expired or expiry date is invalid.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.cvv.length < 3 || formData.cvv.length > 4 || !/^\d+$/.test(formData.cvv)) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV (3-4 digits).",
        variant: "destructive",
      });
      return;
    }
    
    setIsPaid(true);
    
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `Your reservation at ${restaurantName} has been confirmed.`,
      });
      
      setTimeout(() => {
        setIsPaid(false);
        setFormData({
          cardNumber: "",
          cardName: "",
          expiry: "",
          cvv: "",
        });
        setDisplayCardNumber("");
        onOpenChange(false);
      }, 3000);
    }, 1500);
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 19);
    setFormData({ ...formData, cardNumber: limited });
    
    const formatted = limited.match(/.{1,4}/g)?.join(" ") || limited;
    setDisplayCardNumber(formatted);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-payment">
        {isPaid ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="font-heading text-2xl font-semibold mb-2">Payment Successful!</h3>
            <p className="font-body text-muted-foreground text-center mb-4">
              Your reservation has been confirmed
            </p>
            <div className="bg-muted p-4 rounded-lg w-full max-w-xs">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restaurant:</span>
                  <span className="font-medium">{restaurantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold text-primary">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card:</span>
                  <span className="font-medium">
                    {formData.cardNumber.length >= 4 
                      ? `•••• ${formData.cardNumber.slice(-4)}` 
                      : '••••'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">Payment Details</DialogTitle>
              <DialogDescription className="font-body">
                Reserve your table at {restaurantName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName" className="font-ui">
                    Cardholder Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      required
                      data-testid="input-card-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="font-ui">
                    Card Number
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="pl-10"
                      value={displayCardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      required
                      data-testid="input-card-number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="font-ui">
                      Expiry Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="pl-10"
                        value={formData.expiry}
                        onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        required
                        data-testid="input-expiry"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="font-ui">
                      CVV
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="cvv"
                        placeholder="123"
                        className="pl-10"
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        maxLength={4}
                        required
                        data-testid="input-cvv"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Amount</span>
                    <span className="font-heading text-xl font-semibold">${amount}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-cancel-payment"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-payment">
                  Pay ${amount}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
