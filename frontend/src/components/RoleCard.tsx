import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  gradient?: string;
}

export function RoleCard({ 
  icon: Icon, 
  title, 
  description, 
  buttonText, 
  onClick,
  gradient = "from-primary to-success"
}: RoleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className="h-full bg-white/90 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="text-center pb-4">
          <motion.div 
            className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
            whileHover={{ rotate: 10 }}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={onClick}
            className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 transition-opacity`}
            size="lg"
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}