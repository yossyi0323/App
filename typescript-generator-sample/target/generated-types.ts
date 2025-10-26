/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2025-10-27 02:39:50.

export interface User {
    id: number;
    name: string;
    email: string;
    age: number;
    birthDate: Date;
    role: UserRole;
    addresses: Address[];
    active: boolean;
}

export interface Address {
    id: number;
    zipCode: string;
    prefecture: string;
    city: string;
    street: string;
    building: string;
}

export type UserRole = "ADMIN" | "USER" | "GUEST";
