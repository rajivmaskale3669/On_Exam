"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, CheckCircle, XCircle, Shield, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { examService } from "@/lib/data/examService";
import type { Profile, UserRole } from "@/types/database";
import { toast } from "sonner";

export default function UserManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await examService.getProfiles();
      setProfiles(data);
    } catch {
      toast.error("Failed to load user roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (profile: Profile) => {
    setActionLoadingId(profile.id);
    try {
      const ok = await examService.toggleProfileStatus(profile.id, profile.is_active);
      if (ok) {
        toast.success(
          `Account for ${profile.full_name} has been ${profile.is_active ? "suspended" : "activated"}.`
        );
        fetchUsers();
      } else {
        toast.error("Failed to update user status.");
      }
    } catch {
      toast.error("Error toggling account status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFC775]/50">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">
              User Account Directory
            </h1>
            <p className="text-xs text-[#5A5A5A] mt-0.5">
              Review and regulate institutional candidates, educators, and system operators.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#5A5A5A]">
          Total Roster: <strong className="text-[#0B3D2E]">{profiles.length} Accounts</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name or email..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                roleFilter === "all"
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-[#FAF7F0] text-[#5A5A5A] border border-[#DFC775]/50"
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                roleFilter === "student"
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-[#FAF7F0] text-[#5A5A5A] border border-[#DFC775]/50"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter("teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                roleFilter === "teacher"
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-[#FAF7F0] text-[#5A5A5A] border border-[#DFC775]/50"
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                roleFilter === "admin"
                  ? "bg-[#0B3D2E] text-white"
                  : "bg-[#FAF7F0] text-[#5A5A5A] border border-[#DFC775]/50"
              }`}
            >
              Admins
            </button>
          </div>
        </CardContent>
      </Card>

      {/* User Roster Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-[#5A5A5A]">
              Loading user accounts...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Users className="w-10 h-10 text-[#8C8C8C] mx-auto" />
              <p className="text-sm font-semibold text-[#0B3D2E]">
                No matching accounts located
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF7F0] border-b border-[#F4EFE2] text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">User Identity</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Account Status</th>
                    <th className="px-6 py-3.5">Registered On</th>
                    <th className="px-6 py-3.5 text-right">Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE2]">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#0B3D2E] block">
                          {user.full_name}
                        </span>
                        <span className="text-xs text-[#5A5A5A]">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role as any}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={user.is_active ? "success" : "danger"}
                          dot
                        >
                          {user.is_active ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5A5A5A]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== "admin" ? (
                          <Button
                            variant={user.is_active ? "maroon" : "primary"}
                            size="sm"
                            isLoading={actionLoadingId === user.id}
                            onClick={() => handleToggleStatus(user)}
                            leftIcon={
                              user.is_active ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        ) : (
                          <span className="text-xs font-medium text-[#8C8C8C]">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
