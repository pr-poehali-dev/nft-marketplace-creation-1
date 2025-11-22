import json
import os
import random
import hashlib
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle user authentication, registration, verification, and password reset
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with user data or verification status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                email = body_data.get('email')
                password = body_data.get('password')
                nickname = body_data.get('nickname')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                    if cur.fetchone():
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Email already exists'})
                        }
                    
                    if nickname:
                        cur.execute("SELECT id FROM users WHERE nickname = %s", (nickname,))
                        if cur.fetchone():
                            return {
                                'statusCode': 400,
                                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                                'body': json.dumps({'error': 'Nickname already taken'})
                            }
                    
                    verification_code = str(random.randint(100000, 999999))
                    password_hash = hashlib.sha256(password.encode()).hexdigest()
                    
                    cur.execute(
                        "INSERT INTO users (email, password_hash, nickname, verification_code, is_verified, balance) VALUES (%s, %s, %s, %s, false, 0) RETURNING id",
                        (email, password_hash, nickname, verification_code)
                    )
                    user_id = cur.fetchone()['id']
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'user_id': user_id,
                            'verification_code': verification_code,
                            'message': 'Registration successful. Verification code sent to email.'
                        })
                    }
            
            elif action == 'verify':
                user_id = body_data.get('user_id')
                code = body_data.get('code')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT verification_code FROM users WHERE id = %s", (user_id,))
                    user = cur.fetchone()
                    
                    if not user or user['verification_code'] != code:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Invalid verification code'})
                        }
                    
                    cur.execute("UPDATE users SET is_verified = true WHERE id = %s", (user_id,))
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'message': 'Email verified successfully'})
                    }
            
            elif action == 'login':
                email = body_data.get('email')
                password = body_data.get('password')
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT id, email, nickname, balance, is_verified FROM users WHERE email = %s AND password_hash = %s",
                        (email, password_hash)
                    )
                    user = cur.fetchone()
                    
                    if not user:
                        return {
                            'statusCode': 401,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Invalid credentials'})
                        }
                    
                    if not user['is_verified']:
                        return {
                            'statusCode': 403,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Email not verified', 'user_id': user['id']})
                        }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'user': {
                                'id': user['id'],
                                'email': user['email'],
                                'nickname': user['nickname'],
                                'balance': user['balance']
                            }
                        })
                    }
            
            elif action == 'forgot_password':
                email = body_data.get('email')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                    user = cur.fetchone()
                    
                    if not user:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Email not found'})
                        }
                    
                    reset_code = str(random.randint(100000, 999999))
                    cur.execute(
                        "UPDATE users SET reset_code = %s, reset_code_expires = NOW() + INTERVAL '15 minutes' WHERE id = %s",
                        (reset_code, user['id'])
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'reset_code': reset_code,
                            'user_id': user['id'],
                            'message': 'Reset code sent to email'
                        })
                    }
            
            elif action == 'reset_password':
                user_id = body_data.get('user_id')
                code = body_data.get('code')
                new_password = body_data.get('new_password')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT reset_code, reset_code_expires FROM users WHERE id = %s",
                        (user_id,)
                    )
                    user = cur.fetchone()
                    
                    if not user or user['reset_code'] != code:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Invalid reset code'})
                        }
                    
                    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
                    cur.execute(
                        "UPDATE users SET password_hash = %s, reset_code = NULL, reset_code_expires = NULL WHERE id = %s",
                        (password_hash, user_id)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'message': 'Password reset successfully'})
                    }
            
            elif action == 'update_nickname':
                user_id = body_data.get('user_id')
                nickname = body_data.get('nickname')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT id FROM users WHERE nickname = %s AND id != %s", (nickname, user_id))
                    if cur.fetchone():
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Nickname already taken'})
                        }
                    
                    cur.execute("UPDATE users SET nickname = %s WHERE id = %s", (nickname, user_id))
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'nickname': nickname})
                    }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
