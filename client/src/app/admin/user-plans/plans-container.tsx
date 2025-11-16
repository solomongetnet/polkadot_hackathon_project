"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/admin-pagination";
import React from "react";
import { useSearchParams } from "next/navigation";
import {
  clearAllSearchParams,
  deleteSearchParam,
  setValueToSearchParam,
} from "@/utils/search-params";
import { Input } from "@/components/ui/input";
import { Search, Trash } from "lucide-react";
import RefetchDataButton from "../_components/refetch-data-button";
import { useGetUserPlansForAdminQuery } from "@/hooks/api/use-plan"; // make sure these hooks exist
import { TableSkeleton } from "./loaders";
import {
  differenceInDays,
  format,
  formatDistanceToNow,
  isPast,
} from "date-fns";

const PlansContainer = () => {
  const searchParams = useSearchParams();
  const pageSearchParam = Number(searchParams.get("page")) || 1;
  const limitSearchParam = Number(searchParams.get("limit")) || 5;
  const querySearchParam = searchParams.get("query") || "";
  const planStatusSearchParam = searchParams.get("planStatus") || undefined;

  const plansDataQuery = useGetUserPlansForAdminQuery({
    limit: limitSearchParam,
    page: pageSearchParam,
    search: querySearchParam,
    status: planStatusSearchParam,
  });

  useEffect(() => {
    plansDataQuery.refetch();
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setValueToSearchParam("page", page.toString());
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (!value) {
      deleteSearchParam("query");
    } else {
      setValueToSearchParam("query", value);
    }
  };

  const handleLimitChange = (limit: number) => {
    setValueToSearchParam("limit", limit.toString());
  };

  if (plansDataQuery.isLoading || plansDataQuery.isFetching) {
    return <TableSkeleton />;
  }

  if (plansDataQuery.isError || !plansDataQuery.data) {
    return (
      <Card className="overflow-x-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
        <CardContent>
          <p className="text-sm text-destructive py-20 flex justify-center items-center">
            Failed to load plans
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">Detailed Plans Information</CardTitle>
        <div className="flex items-center gap-2">
          <RefetchDataButton
            refetch={plansDataQuery.refetch}
            isLoading={plansDataQuery.isFetching}
          />
          <div className="w-fit flex items-center relative">
            <Search className="w-3.5 absolute left-2.5" />
            <Input
              placeholder="Search"
              className="w-[140px] md:w-[200px] bg-transparent pl-8"
              onChange={handleSearchInputChange}
              defaultValue={querySearchParam}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 overflow-x-scroll max-w-full">
        {plansDataQuery.data.data.length < 1 ? (
          <div className="py-20 w-full flex justify-center items-center flex-col">
            <h2>Can't find any plans matching your criteria</h2>
            {searchParams && (
              <Button variant="outline" onClick={() => clearAllSearchParams()}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expired on</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plansDataQuery.data.data.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-muted/50">
                  <TableCell>
                    <p className="font-medium">{plan.user.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{plan.plan.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {plan.status || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <h2 className="text-sm">
                      {(() => {
                        const endDate = new Date(plan.endDate);
                        const daysLeft = differenceInDays(endDate, new Date());

                        if (isPast(endDate)) {
                          return `Expired on ${format(endDate, "PPP")}`;
                        }

                        if (daysLeft <= 7) {
                          return `Expires in ${formatDistanceToNow(endDate, {
                            addSuffix: false,
                          })}`;
                        }

                        return `Expires on ${format(endDate, "PPP")}`;
                      })()}
                    </h2>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="default" size="icon">
                      <Trash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          currentPage={plansDataQuery.data.pagination.currentPage}
          totalPages={plansDataQuery.data.pagination.totalPages}
          totalItems={plansDataQuery.data.pagination.totalItems}
          limit={plansDataQuery.data.pagination.limit}
          hasMore={plansDataQuery.data.pagination.hasMore}
          previousPage={plansDataQuery.data.pagination.previousPage}
          nextPage={plansDataQuery.data.pagination.nextPage}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          limitOptions={[5, 10, 20, 50]}
        />
      </CardContent>
    </Card>
  );
};

export default PlansContainer;
