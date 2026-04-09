'use client'

import { useEffect, useState, useRef } from 'react';
import { getListProject } from '@/app/api/project';
import PaginationProjects from '@/components/PaginationProjects';
import FeatureBlock from '@/components/FeatureBlock'
import ProjectCard from '@/components/ProjectCard';

export default function Home() {
  // State cho tour trong nước
  const [domesticList, setDomesticList] = useState([]);
  const [domesticPage, setDomesticPage] = useState(1);
  const [domesticTotalPages, setDomesticTotalPages] = useState(1);
  const [domesticLoading, setDomesticLoading] = useState(false);

  // State cho tour nước ngoài
  const [foreignList, setForeignList] = useState([]);
  const [foreignPage, setForeignPage] = useState(1);
  const [foreignTotalPages, setForeignTotalPages] = useState(1);
  const [foreignLoading, setForeignLoading] = useState(false);

  const LIMIT = 9;

  // State for scroll
  const domesticRef = useRef(null);
  const foreignRef = useRef(null);
  const [hasDomesticPageChanged, setHasDomesticPageChanged] = useState(false);
  const [hasForeignPageChanged, setHasForeignPageChanged] = useState(false);

  // handle scroll
  useEffect(() => {
    if (!domesticLoading && domesticRef.current && hasDomesticPageChanged) {
      domesticRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [domesticLoading, domesticPage, hasDomesticPageChanged]);

  useEffect(() => {
    if (!foreignLoading && foreignRef.current && hasForeignPageChanged) {
      foreignRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [foreignLoading, foreignPage, hasForeignPageChanged]);

  // Fetch tour trong nước
  const fetchDomestic = async (pageNum = 1) => {
    setDomesticLoading(true);
    try {
      const res = await getListProject({ page: pageNum, limit: LIMIT, type: 0 });
      setDomesticList(res?.data.listProject || []);
      if (res?.data.totalProject) setDomesticTotalPages(Math.ceil(res.data.totalProject / LIMIT));
    } catch {
      setDomesticList([]);
    } finally {
      setDomesticLoading(false);
    }
  };

  // Fetch tour nước ngoài
  const fetchForeign = async (pageNum = 1) => {
    setForeignLoading(true);
    try {
      const res = await getListProject({ page: pageNum, limit: LIMIT, type: 1 });
      setForeignList(res?.data.listProject || []);
      if (res?.data.totalProject) setForeignTotalPages(Math.ceil(res.data.totalProject / LIMIT));
    } catch {
      setForeignList([]);
    } finally {
      setForeignLoading(false);
    }
  };

  useEffect(() => {
    fetchDomestic(domesticPage);
  }, [domesticPage]);

  useEffect(() => {
    fetchForeign(foreignPage);
  }, [foreignPage]);

  const renderTourCard = (project: any, index: any) => {
    return (
      <ProjectCard
        key={project._id}
        project={project}
        index={index}
      />
    );
  };

  return (
    <>
      <div className="relative">
        <div className="p-6 pt-8 pb-8 md:p-8 mx-auto mb-5 flex flex-col gap-12 xl:max-w-1200px w-full md:w-3/4">
          <FeatureBlock />
          {/* TOUR TRONG NƯỚC */}
          <section ref={domesticRef}>
            <p className="font-semibold text-2xl mb-7 pt-5 text-center fancy-text">TOUR TRONG NƯỚC</p>
            <div className="flex flex-col items-center gap-10 md:flex-row flex-wrap">
              {domesticLoading ? (
                <div>Đang tải...</div>
              ) : (
                domesticList && domesticList.length > 0
                  ? domesticList.map((project, index) => renderTourCard(project, index))
                  : <div className="text-gray-400">Không có tour nào</div>
              )}
            </div>
            <PaginationProjects
              totalPages={domesticTotalPages}
              currentPage={domesticPage}
              onChange={(p: any) => {
                setHasDomesticPageChanged(true);
                setDomesticPage(p);
              }}
              loading={domesticLoading}
            />
          </section>
          {/* TOUR NƯỚC NGOÀI */}
          <section ref={foreignRef}>
            <p className="font-semibold text-2xl mb-7 pt-5 text-center fancy-text">TOUR NƯỚC NGOÀI</p>
            <div className="flex flex-col items-center gap-10 md:flex-row flex-wrap">
              {foreignLoading ? (
                <div>Đang tải...</div>
              ) : (
                foreignList && foreignList.length > 0
                  ? foreignList.map((project, index) => renderTourCard(project, index))
                  : <div className="text-gray-400">Không có tour nào</div>
              )}
            </div>
            <PaginationProjects
              totalPages={foreignTotalPages}
              currentPage={foreignPage}
              onChange={(p: any) => {
                setHasForeignPageChanged(true);
                setForeignPage(p);
              }}
              loading={foreignLoading}
            />
          </section>
        </div>
      </div>
    </>
  );
}
