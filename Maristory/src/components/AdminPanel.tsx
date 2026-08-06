import React, { useState, useEffect } from 'react';
import { Book, AdminCatalogStats, User } from '../types.js';
import { api } from '../services/api.ts';
import { ShieldCheck, Plus, Edit3, Trash2, Library, Users, Bookmark, Sparkles, Image, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';

interface AdminPanelProps {
    user: User;
    onRefreshCatalog: () => void;
}