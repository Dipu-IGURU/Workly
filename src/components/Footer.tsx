import { Button } from "@/components/ui/button";
import React from 'react';
import logo from '@/assets/canhiring.png';
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/src/assets/canhiring.png" 
                alt="Can Hiring Logo" 
                className="h-10 w-auto" 
              />
            </div>
            <p className="text-background/70 mb-4">
              Call now: <span className="text-background font-medium">(319) 555-0115</span>
            </p>
            <p className="text-background/70 text-sm">
              6391 Elgin St. Celina, Delaware 10299, New York, United States of America
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-background">Browse Categories</a></li>
              <li><a href="#" className="hover:text-background">Candidate Dashboard</a></li>
              <li><a href="#" className="hover:text-background">Job Alerts</a></li>
              <li><a href="#" className="hover:text-background">My Bookmarks</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background">Browse Candidates</a></li>
              <li><a href="#" className="hover:text-background">Employer Dashboard</a></li>
              <li><a href="#" className="hover:text-background">Add Job</a></li>
              <li><a href="#" className="hover:text-background">Job Packages</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">About Us</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background">Job Page</a></li>
              <li><a href="#" className="hover:text-background">Job Page Alternative</a></li>
              <li><a href="#" className="hover:text-background">Resume Page</a></li>
              <li><a href="#" className="hover:text-background">Blog</a></li>
              <li><a href="#" className="hover:text-background">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/70 text-sm">
              © 2024 Workly. All Rights Reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background hover:bg-background/10">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;