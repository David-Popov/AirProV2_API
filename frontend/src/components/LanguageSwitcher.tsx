import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-gray-300">
        <DropdownMenuItem onClick={() => changeLanguage('en')} className="hover:bg-slate-800 cursor-pointer">
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('bg')} className="hover:bg-slate-800 cursor-pointer">
          Български
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
