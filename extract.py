import os

page_path = r"d:\Job_Portal\src\app\admin\dashboard\page.tsx"
with open(page_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find AdminManagement start and end
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.startswith("function AdminManagement"):
        start_idx = i
    if line.startswith("function AdminProfileView"):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    admin_mgmt_lines = lines[start_idx:end_idx]
    
    # We want to remove AdminManagement and AdminProfileView from page.tsx
    # Let's find AdminProfileView end.
    end_profile_idx = -1
    for i in range(end_idx, len(lines)):
        if "Administrative Security Protocol" in lines[i]:
            # This is near the end of AdminProfileView
            end_profile_idx = i + 6
            break
            
    manage_admins_path = r"d:\Job_Portal\src\components\admin\ManageAdminsTab.tsx"
    
    with open(manage_admins_path, "w", encoding="utf-8") as f:
        f.write('"use client";\n\n')
        f.write('import React, { useState, useRef } from "react";\n')
        f.write('import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";\n')
        f.write('import { Button } from "@/components/ui/button";\n')
        f.write('import { Input } from "@/components/ui/input";\n')
        f.write('import { Label } from "@/components/ui/label";\n')
        f.write('import { Badge } from "@/components/ui/badge";\n')
        f.write('import { useToast } from "@/hooks/use-toast";\n')
        f.write('import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";\n')
        f.write('import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\n')
        f.write('import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";\n')
        f.write('import { initializeApp } from "firebase/app";\n')
        f.write('import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";\n')
        f.write('import { collection, doc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";\n')
        f.write('import { firebaseConfig } from "@/firebase/config";\n')
        f.write('import { Loader2, Plus, RefreshCw, UserCheck, ShieldAlert, Key, Edit3, Save, Camera, Mail, PhoneCall, Trash2, Calendar, MapPin, Tag, UserCircle, X, Check, Lock, Unlock, Zap, History, Database, Power, AlertTriangle, Monitor, ExternalLink, Activity } from "lucide-react";\n')
        f.write('import { cn } from "@/lib/utils";\n\n')
        
        code = "".join(admin_mgmt_lines).replace("function AdminManagement", "export function ManageAdminsTab")
        f.write(code)

    if end_profile_idx != -1:
        new_lines = lines[:start_idx] + lines[end_profile_idx:]
        with open(page_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print("Successfully extracted ManageAdminsTab and removed both from page.tsx")
    else:
        print("Could not find end of AdminProfileView")
else:
    print("Could not find AdminManagement")
