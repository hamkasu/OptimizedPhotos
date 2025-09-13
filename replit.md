# PhotoVault - Professional Photo Management Platform

## Overview

PhotoVault is a professional photo management platform developed by Calmic Sdn Bhd, designed for secure enterprise photo storage, editing, and organization. The application provides a comprehensive solution for businesses requiring professional-grade photo management capabilities, featuring advanced editing tools, role-based access control, and administrative oversight.

The platform supports multi-user environments with different permission levels (regular users, admins, and superusers), offering features like photo upload, browser-based editing with canvas manipulation, drag-and-drop interfaces, and comprehensive user management systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Server-side rendered HTML with Jinja2 templates
- **CSS Framework**: Bootstrap 5.1.3 for responsive design
- **JavaScript**: Vanilla JavaScript with modular components
- **UI Components**: Custom upload interface with drag-and-drop, canvas-based photo editor, responsive dashboard
- **Security**: CSRF protection integrated throughout forms
- **Mobile Support**: Touch events for mobile photo editing

### Backend Architecture
- **Framework**: Flask 3.0.3 with modular blueprint structure
- **Database ORM**: Flask-SQLAlchemy for database operations
- **Authentication**: Flask-Login with password hashing via Werkzeug
- **File Upload**: Custom secure file handling with MIME type validation
- **Image Processing**: PIL/Pillow for image manipulation and validation
- **Migration Support**: Flask-Migrate for database schema management

### Database Schema
The application uses SQLAlchemy models with two primary entities:
- **User Model**: Stores user credentials, roles (admin/superuser flags), and relationships to photos
- **Photo Model**: Manages photo metadata including original/edited filenames, descriptions, tags, and user associations
- **Relationships**: One-to-many relationship between users and photos with cascade deletion

### Security Implementation
- **Password Security**: Werkzeug password hashing with salt
- **File Validation**: Multi-layer validation including MIME types, file extensions, and size limits
- **CSRF Protection**: Flask-WTF CSRF tokens on all forms
- **Access Control**: Decorator-based role checking for admin and superuser routes
- **Session Management**: Flask-Login secure session handling
- **File Size Limits**: 16MB maximum file upload with efficient validation

### Role-Based Access Control
Three distinct user levels:
- **Regular Users**: Photo upload, editing, and personal management
- **Admins**: User management capabilities and system statistics access
- **Superusers**: Full system control including admin privilege assignment

## External Dependencies

### Core Framework Dependencies
- **Flask Ecosystem**: Flask, Flask-Login, Flask-SQLAlchemy, Flask-Migrate, Flask-WTF
- **Database**: PostgreSQL via psycopg2-binary (SQLite fallback for development)
- **Image Processing**: Pillow for image manipulation and validation
- **Production Server**: Gunicorn for WSGI deployment

### Frontend Dependencies
- **Bootstrap 5.1.3**: UI framework loaded via CDN
- **Bootstrap Icons**: Icon library for consistent visual elements
- **Custom CSS**: Professional styling with Calmic branding

### Security and Utilities
- **python-dotenv**: Environment variable management
- **Werkzeug**: Security utilities for password hashing and file handling
- **Click**: Command-line interface for administrative tasks

### Development Dependencies
The application includes CLI commands for database initialization and superuser creation, suggesting additional development tooling for deployment and maintenance workflows.