/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Book, BookshelfItem } from './types.js';
import { api, getStoredUser, clearAuthData } from './service/api.ts';
import { Header } from './components/Header.tsx';
import { BookshelfView } from './components/BookshelfView.tsx';
import { CatalogView } from './components/CatalogView.tsx';
import { StatsView } from './components/StatsView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { BookDetailModal } from './components/BookDetailModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { Footer } from './components/Footer.tsx';
import { BookOpen, Sparkles, LogIn, Library, ShieldCheck, Heart } from 'lucide-react';